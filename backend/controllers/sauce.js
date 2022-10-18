const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Nouvelle sauce enregistrée !'})})
    .catch(error => { res.status(400).json( { error })})
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
       }
    );
}

exports.modifySauce= (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            const filename = sauce.imageUrl.split('/images/')[1];
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => {
                    if (req.file != undefined) {
                        fs.unlink(`images/${filename}`, (error) => {
                            if (error) throw error
                        })
                    }
                    res.status(200).json({message : 'Objet modifié!'})
                })
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Sauce supprimée !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
}

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
        const UserId = req.body.userId
        const UserLike = req.body.like
        switch(UserLike) {
            // L'utilisateur a aimé la sauce
            case 1:
                sauce.likes++
                sauce.usersLiked.push(UserId)
                sauce.save()
                    .then(() => { res.status(201).json({message: 'Vous avez aimé la sauce !'})})
                    .catch(error => { res.status(400).json( { error })})
                break;
            // L'utilisateur n'a pas aimé la sauce
            case -1:
                sauce.dislikes++
                sauce.usersDisliked.push(UserId)
                sauce.save()
                    .then(() => { res.status(201).json({message: "Vous n'avez pas aimé la sauce !"})})
                    .catch(error => { res.status(400).json( { error })})
                break;
            // L'utilisateur annule son choix
            case 0:
                // Annuler le like
                if (sauce.usersLiked.includes(UserId)) {
                    sauce.likes--
                    const index = sauce.usersLiked.indexOf(UserId);
                    sauce.usersLiked.splice(index, 1)
                    sauce.save()
                        .then(() => { res.status(201).json({message: "Vous avez changé d'avis sur la sauce !"})})
                        .catch(error => { res.status(400).json( { error })})
                }
                // Annuler le dislike
                if (sauce.usersDisliked.includes(UserId)) {
                    sauce.dislikes--
                    const index = sauce.usersDisliked.indexOf(UserId);
                    sauce.usersDisliked.splice(index, 1)
                    sauce.save()
                        .then(() => { res.status(201).json({message: "Vous avez changé d'avis sur la sauce !"})})
                        .catch(error => { res.status(400).json( { error })})
                }             
                break;    
        }
    }).catch(
        (error) => {
            res.status(500).json({
                error: error
            });
        }
    );
}