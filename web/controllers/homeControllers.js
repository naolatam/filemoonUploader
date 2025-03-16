const { getStatistiques, getLoading, getState } = require("../services/statistiqueService");

/**  
@param {Request} req
@param {Response} res
*/

exports.homePage = async (req, res) => {
    res.render("home", {
        title: "Accueil",
        user: req.user,
        getStatistiques: await getStatistiques(),
        loading: (await getState())!= "Ready!",
    });
}