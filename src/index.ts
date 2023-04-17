import { Command } from 'commander';
// @ts-ignore -- We know that `description` is there.
import { name, description, version } from '../package.json'
import { readFile } from './utils';
import Arkana from './language'

const program = new Command();

program
    .name(name.at(0).toUpperCase() + name.slice(1))
    .description(description)
    .version(version);

program.command('run')
    .description('Execute an `.ark` script')
    .argument('<file>', 'file to execute')
    .option('--dry', 'perform a dry-run')
    .action(async (file, options) => {
        const dryRun = options.dry ?? false;
        // We will see if this has either `https://` or `http://` in it.
        // If it does, this means it is one we need to download first.
        if (file.includes('https://') || file.includes('http://')) {
            file = await fetch(file, { method: 'GET ' }).then((res) => res.text()) as string;
        } else {
            file = readFile(file)
        }

        Arkana(file, dryRun);
    });

program.parse();