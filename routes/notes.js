'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Note = require('../models/note');
const Tag = require('../models/tag');
const Folder = require('../models/folder');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/notes', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;
  const userId = req.user.id;

  let filter = { userId };

  /**
   * BONUS CHALLENGE - Search both title and content using $OR Operator
   *   filter.$or = [{ 'title': { $regex: re } }, { 'content': { $regex: re } }];
  */

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.title = { $regex: re };
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  if (tagId) {
    filter.tags = tagId;
  }

  Note.find(filter)
    .populate('tags')
    .sort('created')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOne({ _id: id, userId})
    .populate('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {
  const { title, content, folderId, tags } = req.body;
  const userId = req.user.id;
  const newItem = { title, content, folderId, tags, userId };

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (tags) {
    tags.forEach((tag) => {
      if (!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('The `id` is not valid');
        err.status = 400;
        return next(err);
      } else {
        Tag.findOne({ _id: tag, userId})
          .then(result => {
            if (!result) {
              const err = new Error('This user does not have this tag');
              err.status = 400;
              return next(err);
            }
          });
      }
    });
  }

  // if (folderId) {
  //   if (!mongoose.Types.ObjectId.isValid(folderId)) {
  //     const err = new Error('The `id` is not valid');
  //     err.status = 400;
  //     return next(err);
  //   } else {
  //     Folder.findOne({ _id: folderId, userId})
  //       .then(result => {
  //         if (!result) {
  //           const err = new Error('This user does not have this folder');
  //           err.status = 400;
  //           return next(err);
  //         }
  //       });
  //   }
  // }

  if (folderId) {
    Folder.findOne({ _id: folderId, userId})
      .then(result => {
        if (!result) {
          const err = new Error('This user does not have this folder');
          err.status = 400;
          return next(err);
        }
      });
  }


  Note.create(newItem)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content, folderId, tags } = req.body;
  const userId = req.user.id;

  const updateItem = { title, content, tags, userId };
  const options = { new: true };

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (mongoose.Types.ObjectId.isValid(folderId)) {
    updateItem.folderId = folderId;
  }

  if (folderId) {
    Folder.findOne({ _id: folderId, userId})
      .then(result => {
        if (!result) {
          const err = new Error('This user does not have this folder');
          err.status = 400;
          return next(err);
        }
      });
  }
  
  if (tags) {
    tags.forEach((tag) => {
      if (!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('The `id` is not valid');
        err.status = 400;
        return next(err);
      } else {
        Tag.findOne({ _id: tag, userId })
          .then(result => {
            if (!result) {
              const err = new Error('This user does not have this tag');
              err.status = 400;
              return next(err);
            }
          });
      }
    });
  }


  Note.findByIdAndUpdate(id, updateItem, options)
    .populate('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  Note.findOneAndRemove( {_id: id, userId} )
    .then(result => {
      if (result) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;