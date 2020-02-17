import fs from 'fs';

import TOML from '@iarna/toml';

function checkFileExist(path, exit) {
    if (fs.existsSync(path))
        return (true);
    else
        if (exit) {
            console.error("The file " + path + " doesn't exist, can't continue. Please check the documentation for further details.");
            process.exit(1);
        }
        else
            return (false);
}

export default function loadTOMLConfig(filename) {
    checkFileExist(filename, true);
    return(TOML.parse(fs.readFileSync(filename)));
}