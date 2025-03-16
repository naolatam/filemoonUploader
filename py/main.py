from core.fileMoonAPI import *
from core.dirNavigation import *
import logging
import tkinter as tk
from tkinter import filedialog
from dotenv import load_dotenv
import os


load_dotenv()

def chooseVideoToUpload():
    root = tk.Tk()
    root.withdraw()
    video_files = filedialog.askopenfilenames(
        title="Select Video Files",
        filetypes=[
            ("Video Files", "*.mp4 *.avi *.mkv *.mov *.flv *.wmv"),
        ]
    )
    if not video_files:
        logging.info("No files selected")
        return
    root.destroy()
    return video_files

def chooseRemoteDirectory(fileMoonManager : FileMoonAPI):
    logging.info("Fetching virtual directory...")
    if fileMoonManager._VirtualDir == {}:
        fileMoonManager._VirtualDir = fileMoonManager.get_virtualDir()
    logging.info("Virtual directory fetched")
    navigationReturn = navigate_directory(fileMoonManager._VirtualDir)
    match navigationReturn["action"]:
        case "select":
            logging.info(f"Selected directory: {navigationReturn['path']}")
            return navigationReturn["fldId"]
        case "create":
            res = fileMoonManager.create_directory(navigationReturn["name"], navigationReturn["fldId"])
            if res["status"] == 200:
                logging.info(f"Directory '{navigationReturn['name']}' created successfully")
                pos = fileMoonManager._VirtualDir
                for i in navigationReturn["full_path"]:
                    pos = pos[i]
                pos[navigationReturn["name"] + " - ID: " + res["result"]["fld_id"]] = {}

            else:
                logging.error(f"Error creating directory: {res}")
            return chooseRemoteDirectory(fileMoonManager)
        case "error":
            logging.error("An error occurred")
            return chooseRemoteDirectory(fileMoonManager)
        case _:
            logging.error("Unexpected error")
            return chooseRemoteDirectory(fileMoonManager)
    return

def main():
    logging.basicConfig(level=logging.INFO)
    
    fileMoonManager = FileMoonAPI(os.getenv("API_KEY"))
    if fileMoonManager.connect(os.getenv("API_KEY")) == False:
        logging.error("Connection failed")
    else:
        logging.info("Connection successful")
    fld_id = chooseRemoteDirectory(fileMoonManager)
    videoFile = chooseVideoToUpload()
    videoFile = sorted(videoFile)
    for i in videoFile:
        logging.info(f"Uploading {i.split('/')[-1]}...")
        res = fileMoonManager.upload_file(i, fld_id)
        if res["status"] == 200:
            logging.info(f"File '{i.split('/')[-1]}' uploaded successfully")
        elif res["status"] == 400:
            logging.error(f"File already uploaded: {res['message']}")
        else:
            logging.error(f"Error uploading file: {res}")
    logging.info("All files uploaded successfully")

main()