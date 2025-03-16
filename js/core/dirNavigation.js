const inquirer = require('inquirer').default;

async function navigateDirectory(directory) {
    /**
     * Navigate a virtual directory using inquirer with an option to create new directories.
     */
    let currentPath = [];
    let currentFullPath = [];
    let currentFldId = [0];
    let stack = [directory];

    while (true) {
        const currentLevel = stack[stack.length - 1];
        let options = [];

        // Add the option to go back if not at the root level
        if (stack.length > 1) {
            options.push(".. (Back)");
        }

        // Add subdirectories at the current level
        options = options.concat(Object.keys(currentLevel));

        // Add option to create a new directory
        options.push("Create New Directory");

        // Prompt the user for selection
        const question = {
            type: 'list',
            name: 'choice',
            message: `Current path: ${currentPath.join('/') || 'Root'}`,
            choices: options,
        };

        const answer = await inquirer.prompt(question);
        const selectedOption = answer.choice;

        if (selectedOption === ".. (Back)") {
            // Go back to the previous level
            stack.pop();
            currentPath.pop();
            currentFldId.pop();
        } else if (selectedOption === "Create New Directory") {
            // Confirm directory creation
            const confirm = await inquirer.prompt({
                type: 'confirm',
                name: 'confirm',
                message: 'Do you want to create a new directory here?',
                default: true,
            });

            if (confirm.confirm) {
                // Ask for the directory name
                const nameAnswer = await inquirer.prompt({
                    type: 'input',
                    name: 'dirName',
                    message: 'Enter the name of the new directory:',
                });

                const newDirName = nameAnswer.dirName;
                if (newDirName) {
                    // Add the new directory to the structure
                    currentLevel[newDirName] = {};
                    return {
                        fldId: currentFldId[currentFldId.length - 1],
                        name: newDirName,
                        full_path: currentFullPath,
                        action: 'create',
                    };
                }
            }
        } else if (currentLevel[selectedOption]) {
            // Go deeper into the selected directory
            currentPath.push(selectedOption.split(' - ID: ')[0]);
            currentFullPath.push(selectedOption);
            stack.push(currentLevel[selectedOption]);
            currentFldId.push(selectedOption.split(' - ID: ')[1]);
        } else {
            // Safety exit in case of unexpected input
            return { action: 'error' };
        }

        // Confirm selection when an empty directory is reached
        if (Object.keys(currentLevel[selectedOption] || {}).length === 0 && selectedOption !== "Create New Directory") {
            const confirm = await inquirer.prompt({
                type: 'confirm',
                name: 'confirm',
                message: `Do you want to select '${currentPath.join('/')}'?`,
                default: true,
            });

            if (confirm.confirm) {
                return {
                    fldId: currentFldId[currentFldId.length - 1],
                    name: selectedOption,
                    path: currentPath,
                    stack,
                    action: 'select',
                };
            }
        }
    }
}

module.exports = navigateDirectory;
