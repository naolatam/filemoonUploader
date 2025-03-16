const { getStatistiques, getLoading, getState, getStatus } = require("../services/statistiqueService");

/**  
@param {Request} req
@param {Response} res
*/

exports.state = async (req, res) => {
    res.json({
        status: await getStatus(),
        loading: await getLoading(),
        state: await getState()
    })
}