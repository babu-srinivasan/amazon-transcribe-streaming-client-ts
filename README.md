LCA Client utility makes it easier to test Call Event Processors and LCA UI without having to actually make a phone call.
Simulates LCA call events required by Call Event Processor. Uses call recording (stereo file) as input and writes
the events to LCA's KDS (integration layer). Supports both TCA and Standard transcribe modes.

## How to use
The code runs locally from your terminal command line or from cloud shell/cloud9 command line. 
git clone the repo to your local environment.

1. `yarn run setup` to setup the package dependencies
2. Update the following variables in CallSimulator.ts, if required.
```javascript
const SAMPLE_RATE = 8000;
const BYTES_PER_SAMPLE = 2;
const CHUNK_SIZE_IN_MS = 200;
const LANGUAGE_CODE = 'en-US';
const savePartial = false;
```
3. `yarn run build` to build and check for build error
4. `yarn run exec <mediaFileName> [api-mode] [region]`
    where `api-mode` - standard  
          `region` - AWS region

    e.g. `yarn run exec data/sample90seconds.wav standard us-east-1`

Notes:
1. By default, transcripts/analytics outputs are written to stdout. You can pipe the output to a file. 
2. Sample audio files are provided in `data/` directory.