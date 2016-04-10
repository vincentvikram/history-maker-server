var express = require('express');
var router = express.Router();

router.get('/diagrams/:diagramId/latest', function (req, res) {
    var diagramId = req.params.diagramId;

    req.db.get('diagram_versions').findOne(
        { diagram: diagramId },
        { sort: { _id: -1 } }
    ).success(function (doc) {
        if (!doc) {
            res.status(404).json({});
        } else {
            res.json(doc);
        }
    }).error(function () {
        res.status(500).json({});
    });
});

router.post('/diagrams/:diagramId/versions', function(req, res) {
    var diagramId = req.params.diagramId;

    req.db.get('diagrams').findOne({
        $query: { id: diagramId },
    }).success(function (dia) {
        function insertVersion() {
            req.db.get('diagram_versions').insert({
                diagram: diagramId,
                data: req.body.data,
            }).success(function (doc) {
                req.db.get('diagrams').update(
                    { id: diagramId },
                    { $push: { versions: doc._id } }
                ).success(function () {
                    res.status(200).json({});
                }).error(function () {
                    res.status(500).json({});
                });
            }).error(function () {
                res.status(500).json({});
            });
        }

        if (!dia) {
            req.db.get('diagrams').insert({
                id: diagramId
            }).success(insertVersion).error(function () {
                res.status(500).json({});
            });
        } else {
            insertVersion();
        }
    }).error(function () {
        res.status(500).json({});
    });
});

module.exports = router;
