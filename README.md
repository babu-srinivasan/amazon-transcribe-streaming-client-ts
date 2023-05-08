Transcribe streaming client utility makes it easier to test Transcribe streaming API by streaming an audio file to Transcribe service. Uses audio file (recorded in supported formats) as input and writes the transcriptions to the console. Supports Standard transcribe mode.

## How to use
The code runs locally from your terminal command line or from cloud shell/cloud9 command line. 
git clone the repo to your local environment.

1. `npm run setup` to setup the package dependencies
2. Update the following variables in CallSimulator.ts, if required.
```javascript
const SAMPLE_RATE = 8000;
const BYTES_PER_SAMPLE = 2;
const CHUNK_SIZE_IN_MS = 200;
const LANGUAGE_CODE = 'en-US';
const savePartial = false;
const CV = 'xxxxxx'
```
3. `npm run build` to build and check for build error
4. `npm run exec <mediaFileName> [region]`

    where `region` - AWS region. Defaults to 'us-east-1'

    e.g. `npm run exec data/sample90seconds.wav us-east-1`

Notes:
1. By default, transcripts/analytics outputs are written to stdout. You can pipe the output to a file. 
2. Sample audio files are provided in `data/` directory.