# Filemoon Uploader script
By devex

## 📚 Description
This project is a file uploader service tailored for seamless integration with [Filemoon](https://filemoon.to). Initially developed in Python, it was later rewritten in JavaScript and ultimately transformed into a fully functional web application to enhance accessibility and automation. 

The service enables users to upload multiple files in a preferred order directly to a specific Filemoon directory, eliminating the need for prolonged manual supervision.

## ✨ Features
- **Multi-file Upload**: Upload multiple files simultaneously with a user-friendly interface.
- **Custom Directory Selection**: Choose specific directories on Filemoon for file uploads.
- **Progress Tracking**: Real-time progress page to monitor upload status.
- **Error Handling**: Robust error messages for failed uploads or invalid files.
- **Authentication Integration**: Private login using token generated in console.
- **Responsive Design**: Fully optimized for desktop and mobile devices.


## 💻 Used Technologies
* ![PYTHON][PY-IMG]
* ![NODE.JS][NODEJS-IMG]
* ![EXPRESS][EXPRESS-IMG]
* ![EJS][EJS-IMG]
* ![TailwindCSS][tailwind-img]
* [![JS][JS-img]][JS-url]
* ![HTML5][HTML-IMG]
* ![CSS3][CSS-IMG]


## ▶️ How to Run
1) Clone the repository from GitHub using this command: 
    ```bash
    git clone https://github.com/naolatam/filemoonUploader
    ```
3) Navigate to the project directory: `cd filemoonUploader`
4) Navigate to the version you want to use: `cd {js|py|web}` (select one only)
5) Copy the `.env.example` file and rename it to `.env`, replace the value with your API key.
6) If you want to use the web app, the environment file is located inside the `config` folder. Copy the `env.exemple.js` file and rename it to `env.js`, then replace information inside by yours.
7) Run the program,
    - If you use the `py` version, run :
        ```bash
        py -m pip install inquirer logging pycurl
        py main.py
        ```
    - If you use the `js` version, run :
        ```bash
        npm install
        node index.js
        ```
    - If you use the `web` version, run : 
        ```bash
        npm install
        node server.js
        ```


## 🌐 Online Demo
Maybe it will be added later 🌟


## 👥 Contributors
This project was developed by:
<br>

<a href="https://github.com/naolatam"><img src="https://avatars.githubusercontent.com/u/59016480?v=4" width="50" alt="Mata Loan"></a>



[trello-img]: https://img.shields.io/badge/Trello-%23026AA7.svg?style=for-the-badge&logo=Trello&logoColor=white
[canva-img]: https://img.shields.io/badge/Canva-%2300C4CC.svg?style=for-the-badge&logo=Canva&logoColor=white
[gitea-img]: https://img.shields.io/badge/Gitea-%2300ACD7.svg?style=for-the-badge&logo=Gitea&logoColor=white
[github-img]: https://img.shields.io/badge/GitHub-%23121011.svg?style=for-the-badge&logo=github&logoColor=white

[tailwind-img]: https://img.shields.io/badge/TailwindCSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white
[JS-img]: https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E
[JS-url]: https://www.javascript.com
[HTML-IMG]: https://img.shields.io/badge/html5-%23E34F00.svg?style=for-the-badge&logo=html5&logoColor=white
[GO-IMG]: https://img.shields.io/badge/Go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white
[CSS-IMG]: https://img.shields.io/badge/css3-%2300ADD8.svg?style=for-the-badge&logo=css3&logoColor=white
[PY-IMG]: https://img.shields.io/badge/python3.+-%231572B6.svg?style=for-the-badge&logo=python&logoColor=yellow
[NODEJS-IMG]: https://img.shields.io/badge/node.js-%231572B6.svg?style=for-the-badge&logo=node.js&logoColor=green
[EJS-IMG]: https://img.shields.io/badge/EJS-%231572B6.svg?style=for-the-badge&logo=ejs&logoColor=green
[EXPRESS-IMG]: https://img.shields.io/badge/express-%231572B6.svg?style=for-the-badge&logo=express&logoColor=green