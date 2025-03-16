const config = require("../config/env")
const fs = require("fs")
const path = require("path")
exports.oldPage = async (req, res) => {
  function getFilesRecursive(dir, baseDir = "") {
    let results = [];
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const relativePath = path.join(baseDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Si c'est un dossier, on l'explore récursivement
        results.push({
          name: file,
          type: "folder",
          path: relativePath,
          children: getFilesRecursive(fullPath, relativePath),
        });
      } else if (/\.(mp4|mkv|webm|ogg)$/i.test(file)) {
        // Si c'est un fichier vidéo, on l'ajoute
        results.push({ name: file, type: "file", path: relativePath });
      }
    });

    return results;
  }

  const filesTree = getFilesRecursive(config.video_path);

  function generateHTML(files) {
    return `
                <ul>
                    ${files
                      .map((file) =>
                        file.type === "folder"
                          ? `<li><strong>${file.name}</strong>${generateHTML(
                              file.children
                            )}</li>`
                          : `<li>
                            <a href="/video/${file.path}" target="_blank">${file.name}</a>
                            <br>
                            <video controls width="300">
                                <source src="/video/${file.path}" type="video/mp4">
                                Votre navigateur ne supporte pas la lecture de vidéos.
                            </video>
                        </li>`
                      )
                      .join("")}
                </ul>
            `;
  }

  res.send(`
            <html>
            <head>
                <title>Liste des Vidéos</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                    a { text-decoration: none; color: blue; }
                    video { max-width: 100%; margin-top: 10px; }
                    ul { list-style: none; padding-left: 20px; }
                </style>
            </head>
            <body>
                <h1>Liste des Vidéos</h1>
                ${generateHTML(filesTree)}
            </body>
            </html>
        `);
};
