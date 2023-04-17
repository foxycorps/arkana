import fs from 'fs-extra';
// import path from 'path';
// import chalk from 'chalk';

import language from 'language';
import Interpreter from 'language/interpreter';
import { join } from 'path';
import { cwd } from 'process';
// import { logo, handleStep, contextGenerator} from 'utils';
// import { homedir } from 'os';
// import Listr from 'listr';
// import { promisify } from 'util';
// // import { execa } from 'execa';
// const exec = promisify(require('child_process').exec);

// const HOME = homedir();

// const fileName = 'installar.config'
// const filePath = path.join(process.cwd(), fileName);
// let pathToUse = HOME

// const commandStart = () => `cd ${pathToUse} &&`

// const command = (cmd: string): Promise<any> => exec(`${commandStart()} ${cmd}`);

// const readConfig = (contents: any): any[] => {
//     const { config } = contents;
//     return new Listr([{
//         title: config?.location ? `Switching working directory to "${path.join(HOME, config?.location?.value)}"` : `Switching working directory to ${HOME}`,
//         task: () => {
//             pathToUse = config?.location ? path.join(HOME, config?.location?.value) : HOME;
//         }
//     },

//     {
//         title: `Making directory`,
//         task: (ctx, task) => {
//             if (config?.needsMaking?.value === 'true') {
//                 fs.ensureDirSync(pathToUse);
//             } else {
//                 task.skip('Was not asked to make the directory')
//             }
//         }
//     }])
// }

// const readSteps = (contents: any) => {
//     const {steps} = contents;

//     const tasks = [];

//     for (const [stepName, stepInfo] of Object.entries(steps)) {
//         tasks.push({
//             title: `STEP - ${stepName}`,
//             task: (ctx) => {

//                 const subTasks = [
//                     {
//                         title: "Generating step context",
//                         task: (ctx) => {
//                             ctx.context = contextGenerator(stepInfo);
//                         }
//                     }
//                 ];
//                 for (const stepPartName of Object.keys(stepInfo)) {
//                     subTasks.push(handleStep(stepPartName, command))
//                 }

//                 return new Listr(subTasks)
//             }
//         })
//     }

//     return new Listr(tasks)
// }

// // const readSteps = async (contents: any): Promise<void> => {
// //     const { steps } = contents;
// //     for (const [stepName, stepInfo] of Object.entries(steps)) {

// //         // const s = log.section(`STEP - ${stepName}`);
// //         // const stepContext = contextGenerator(stepInfo, s);

// //         const stepParts = Object.keys(stepInfo).map((stepPartName: string) => handleStep(stepPartName, stepContext, command, s));
// //         console.log({stepParts})
// //         Promise.all(stepParts).then(() => {
// //             console.log("HERE")
// //             const position = Object.keys(steps).indexOf(stepName);
// //             s.end(true, position === Object.keys(steps).length - 1);
// //         }).catch(error => console.log(error))
// //     }
// // }

// ( async ( ) => {
//    // We are going to look for the config file called `installar.config`
//    console.clear();
//    console.log(chalk.magenta(logo));
//    console.log(`[${Array(77).join(".")}]`)


//    const foundFile = fs.existsSync(filePath);
//    const tasks = new Listr([
//     {
//         title: 'Locate Installa file',
//         task: (ctx) => {
//             if (!foundFile) {
//                 throw new Error(`Could not locate ${fileName}`)
//             } else {
//                 ctx.fileContents = fs.readFileSync(filePath, 'utf-8')
//             }
//         }
//     },
//     {
//         title: "Translate Installa file",
//         task: (ctx) => {
//             try {
//                 ctx.result = language(ctx.fileContents);
//             } catch {
//                 throw new Error('Could not translate Installa file')
//             }
//         }
//     },
//     {
//         title: "Read Config",
//         enabled: ctx => ctx.result?.config,
//         task: (ctx) => {
//             return readConfig(ctx.result)
//         }
//     },
//     {
//         title: "Run Steps",
//         task: (ctx) => {
//             return readSteps(ctx.result)
//         }
//     }
//    ]);

//    tasks.run().catch(err => {
//        console.error(err);
//    }).finally(() => console.log(`[${Array(77).join(".")}]`))
// //    console.log(`[${Array(77).join(".")}]`)
// //    if (foundFile) {
// //        // We are good to go
// //         startup.info('Installar file located');
// //         const contents = fs.readFileSync(filePath, 'utf-8');
// //         let result: any;
// //         try {
// //             result = language(contents);
// //             startup.info('Successfully read Installar file')
// //             if (!result.config?.location) {
// //                 startup.warn('No config was provided. This will run in the root directory');
// //             } else {
// //                 startup.info('Config provided. Will use path provided in config')
// //             }
// //             startup.info(`Found ${Object.keys((result as any)?.steps).length} steps`)
// //             startup.end(true);
// //         } catch (e) {
// //             startup.error('There was an error reading the contents');
// //             startup.error(e);
// //             startup.end(false, true);
// //             process.exit(1);
// //         }

// //         try {
// //             readConfig(result);
// //             readSteps(result);
// //         } catch {}
// //    } else {
// //        startup.error(`"${fileName}" not found`);
// //        startup.end(false, true);
// //        process.exit(1);
// //     }
// } )();
(() => {
    const fileContents = fs.readFileSync(join(cwd(), 'basic.ark'), 'utf-8');
    const lang = language(fileContents);
    const int = new Interpreter(lang);
    int.interpret();
    int.executeTasks();
    // console.log({ lang })
    // console.log({ lang })

    // let tokens: any[] = [lang.lookahead];
    // while (!(lang as any).end()) {
    //     let temp = lang.next();
    //     console.log({ temp })
    //     if (temp.type.name === 'end') break;
    //     tokens.push(temp)
    // }

    // fs.writeFileSync(join(cwd(), 'output.json'), JSON.stringify(tokens, null, 4), 'utf8')
    fs.writeFileSync(join(cwd(), 'parsed.json'), JSON.stringify(lang, null, 4), 'utf8')
})();