"use strict";

const noteCacheService = require('../../services/note_cache');
const repository = require('../../services/repository');

async function getAutocomplete(req) {
    const query = req.query.query;

    let results;

    if (query.trim().length === 0) {
        results = await getRecentNotes();
    }
    else {
        results = noteCacheService.findNotes(query);
    }

    return results.map(res => {
        return {
            value: res.path,
            label: res.title
        }
    });
}

async function getRecentNotes() {
    const recentNotes = await repository.getEntities(`
      SELECT 
        recent_notes.* 
      FROM 
        recent_notes
        JOIN branches USING(branchId)
      WHERE
        recent_notes.isDeleted = 0
        AND branches.isDeleted = 0
      ORDER BY 
        dateCreated DESC
      LIMIT 200`);

    return recentNotes.map(rn => {
        return {
            path: rn.notePath,
            title: noteCacheService.getNoteTitleForPath(rn.notePath.split('/'))
        };
    });
}

module.exports = {
    getAutocomplete
};