import inquirer

def navigate_directory(directory):
    """Navigate a virtual directory using inquirer with an option to create new directories."""
    current_path = []
    current_full_path = []
    current_fldId = [0]
    stack = [directory]

    while True:
        current_level = stack[-1]
        options = []

        # Add the option to go back if not at the root level
        if len(stack) > 1:
            options.append(".. (Back)")

        # Add subdirectories at the current level
        options.extend(current_level.keys())

        # Add option to create a new directory
        options.append("Create New Directory")

        # Prompt the user for selection
        question = [
            inquirer.List(
                "choice",
                message=f"Current path: {'/'.join(current_path) or 'Root'}",
                choices=options,
            )
        ]
        answer = inquirer.prompt(question, raise_keyboard_interrupt=True)

        # Handle selection or exit
        selected_option = answer["choice"]

        if selected_option == ".. (Back)":
            # Go back to the previous level
            stack.pop()
            current_path.pop()
            current_fldId.pop()
        elif selected_option == "Create New Directory":
            # Confirm directory creation
            confirm = [
                inquirer.Confirm(
                    "confirm",
                    message="Do you want to create a new directory here?",
                    default=True,
                )
            ]
            confirm_answer = inquirer.prompt(confirm, raise_keyboard_interrupt=True)
            if confirm_answer["confirm"]:
                # Ask for the directory name
                name_question = [
                    inquirer.Text("dir_name", message="Enter the name of the new directory")
                ]
                name_answer = inquirer.prompt(name_question, raise_keyboard_interrupt=True)
                new_dir_name = name_answer["dir_name"]
                # Add the new directory to the structure
                if new_dir_name:    
                    current_level[new_dir_name] = {}
                    return {"fldId": current_fldId[-1], "name": new_dir_name, "full_path": current_full_path, "action": "create"}
        elif selected_option in current_level:
            # Go deeper into the selected directory
            current_path.append(selected_option.split(" - ID: ")[0])
            current_full_path.append(selected_option)
            stack.append(current_level[selected_option])
            current_fldId.append(selected_option.split(" - ID: ")[1])
        else:
            # Safety exit in case of unexpected input
            return {"action": "error"}

        # Confirm selection when an empty directory is reached
        if not current_level.get(selected_option, {}) and selected_option != "Create New Directory":
            confirm = [
                inquirer.Confirm(
                    "confirm",
                    message=f"Do you want to select '{'/'.join(current_path)}'?",
                    default=True,
                )
            ]
            confirm_answer = inquirer.prompt(confirm, raise_keyboard_interrupt=True)
            if confirm_answer["confirm"]:
                return {"fldId": current_fldId[-1], "name": selected_option, "path": current_path, "stack": stack, "action": "select"}
