/* eslint-disable n/no-process-env */

export default function getProcessEnv (): NodeJS.ProcessEnv {

    return { ...process.env };

}
