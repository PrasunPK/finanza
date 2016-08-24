var exec = require('child_process').exec;

var migration = function () {
    return exec('$MIGRATION_SCRIPT_PATH', function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}

module.exports = migration;