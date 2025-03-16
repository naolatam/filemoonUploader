import requests, logging, pycurl, json, time
from io import BytesIO

class FileMoonAPI:
    def __init__(self, API_KEY):
        self.__API = API_KEY
        self._Session = requests.Session()
        self._VirtualDir = {}

    def connect(self, api_key):
        r = self._Session.get(f"https://filemoonapi.com/api/account/info?key={api_key}")
        if r.json()["status"] == 200:
            self.__API = api_key
            return True
        return False
    
    def get_directory(self, dirId=None):
        r = self._Session.get(f"https://filemoonapi.com/api/folder/list?key={self.__API}{f'&fld_id={dirId}' if dirId else ''}")
        time.sleep(0.2)
        return r.json()
    
    def get_virtualDir(self, id=None):
        VIRT_DIR = {}
        dirList = self.get_directory(id)
        for i in dirList["result"]["folders"]:
            VIRT_DIR[f"{i["name"]} - ID: {i["fld_id"]}"] = {}
            VIRT_DIR[f"{i["name"]} - ID: {i["fld_id"]}"] = self.get_virtualDir(i["fld_id"])
        return VIRT_DIR
    
    def create_directory(self, name, parent_id):
        r = self._Session.get(f"https://filemoonapi.com/api/folder/create?key={self.__API}&name={name}&parent_id={parent_id}")
        return r.json()
    
    def get_upload_server(self):
        r = self._Session.get(f"https://filemoonapi.com/api/upload/server?key={self.__API}")
        if r.json()["status"] == 200:
            return r.json()["result"]

    def upload_file(self, file, fld_id):
        fileExist = self.get_file_by_name(file.split("/")[-1])
        if fileExist["status"] == 200 and fileExist["result"]["results"] != 0:
            return {"status": 400, "message": "File already exists"}
        serverUrl = self.get_upload_server()

        startTime = time.time()
        buffer = BytesIO()
        value = [
            ('key', self.__API),
            ('fld_id', fld_id),
            ('file', (pycurl.FORM_FILE, file.encode("utf-8")))
            ]
        c = pycurl.Curl()
        c.setopt(pycurl.URL, serverUrl)
        c.setopt(pycurl.HTTPHEADER, ['Accept: application/json'])
        c.setopt(pycurl.HTTPPOST, value )
        c.setopt(pycurl.WRITEDATA, buffer)
        c.setopt(pycurl.VERBOSE, True)
        c.perform()
        c.close()
        logging.info(f"Upload time: {time.time() - startTime}")
        try:
            r = buffer.getvalue()
            r = r.decode("utf-8")
            r = json.loads(r)
            return r
        except Exception as e:
            logging.error(e)
            return {"status": 402, "message": "Error uploading file"}
        
    def get_file_by_id(self, file_code):
        r = self._Session.get(f"https://filemoonapi.com/api/file/info?key={self.__API}&file_code={file_code}")
        try:
            return r.json()
        except:
            return {"status": 400, "message": "File not found"}

    def get_file_by_name(self, file_name):
        
        r = self._Session.get(f"https://filemoonapi.com/api/file/list?key={self.__API}&title={' '.join(file_name.split('.')[0:-1])}")
        try:
            return r.json()
        except:
            return {"status": 400, "message": "File not found"}