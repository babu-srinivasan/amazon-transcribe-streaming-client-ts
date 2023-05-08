//Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//SPDX-License-Identifier: Apache-2.0

import { 
    TranscribeStreamingClient,
    TranscribeStreamingClientConfig,
    TranscriptResultStream,
    StartStreamTranscriptionCommand,
    TranscriptEvent,
} from '@aws-sdk/client-transcribe-streaming';

import * as chain from 'stream-chain';
import * as fs from 'fs';
import { WriteStream, createWriteStream } from 'fs';

const SAMPLE_RATE = 48000;
const BYTES_PER_SAMPLE = 2;
const CHUNK_SIZE_IN_MS = 200;
const LANGUAGE_CODE = 'en-US';
const savePartial = false;
const CV = 'fs-cv-final-v1';

export class CallSimulator {
    readonly _client: TranscribeStreamingClient;
    readonly _mediafilename: string;
    readonly _outputfilename: string;
    fileWriter: WriteStream | null;


    constructor(mediaFileName: string, region?: string) {
        const clientconfig: TranscribeStreamingClientConfig = {
            region: region
        };
        try {
            this._client = new TranscribeStreamingClient(clientconfig);
            // console.info('Created Transcribe Streaming client');
        } catch (error) {
            console.error('Error creating Transcribe Streaming client', error);
            process.exit(1);
        }

        this._mediafilename = mediaFileName;
        this._outputfilename = 'transcripts/'+mediaFileName.substring(mediaFileName.lastIndexOf('/')+1) + '.jsonl';
        this.fileWriter = createWriteStream(this._outputfilename, { encoding: 'utf-8' });
    }

    async writeTranscriptionSegment(transcribeMessageJson:TranscriptEvent):Promise<void> {

        if (transcribeMessageJson.Transcript?.Results && transcribeMessageJson.Transcript?.Results.length > 0) {
            if (transcribeMessageJson.Transcript?.Results[0].Alternatives && transcribeMessageJson.Transcript?.Results[0].Alternatives?.length > 0) {
               
                const result = transcribeMessageJson.Transcript?.Results[0];
    
                if (result.IsPartial == undefined || (result.IsPartial == true && !savePartial)) {
                    return;
                }
                // const { Transcript: transcript } = transcribeMessageJson.Transcript.Results[0].Alternatives[0];
                this.fileWriter?.write(JSON.stringify(result)+'\n');
            }
        }
    }

    async writeTranscriptEvents():Promise<void>{

        const CHUNK_SIZE = (SAMPLE_RATE * BYTES_PER_SAMPLE)*CHUNK_SIZE_IN_MS/1000;

        // const timer = (millisec: number) => new Promise(cb => setTimeout(cb, millisec));
        const audiopipeline:chain = new chain([
            fs.createReadStream(this._mediafilename, { highWaterMark: CHUNK_SIZE }),
            async data => {
                // await timer(CHUNK_SIZE_IN_MS);
                return data;
            }
        ]);

        // const audiopipeline = fs.createReadStream(this._mediafilename, { highWaterMark: 3200 }); 

        const transcribeInput = async function* () {

            for await (const chunk of audiopipeline) {
                yield { AudioEvent: { AudioChunk: chunk } };
            }
        };

        const response = await this._client.send(
            new StartStreamTranscriptionCommand({
                LanguageCode: LANGUAGE_CODE,
                MediaSampleRateHertz: SAMPLE_RATE,
                MediaEncoding: 'pcm',
                EnableChannelIdentification: false,
                ShowSpeakerLabel: true,
                VocabularyName: CV,
                AudioStream: transcribeInput()
            })
        );
        console.info(
            `${this._mediafilename}, ${response.SessionId}, STARTED`
        );
        const outputTranscriptStream: AsyncIterable<TranscriptResultStream> | undefined = response.TranscriptResultStream;
    
        if (outputTranscriptStream) {   
            for await (const event of outputTranscriptStream) {
                if (event.TranscriptEvent) {
                    const message: TranscriptEvent = event.TranscriptEvent;
                    await this.writeTranscriptionSegment(message);
                }
            }
            this.fileWriter?.close();
            console.info(
                `${this._mediafilename}, ${response.SessionId}, COMPLETED`
            );
        }
    }
}