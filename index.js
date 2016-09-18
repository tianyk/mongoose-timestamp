/*!
 * Mongoose Timestamps Plugin
 * Copyright(c) 2012 Nicholas Penree <nick@penree.com>
 * Original work Copyright(c) 2012 Brian Noguchi
 * MIT Licensed
 */

var defaults = require('defaults');

function timestampsPlugin(schema, options) {
    var updatedAt = 'updatedAt';
    var createdAt = 'createdAt';
    var updatedAtOpts = Number;
    var createdAtOpts = Number;
    var dataObj = {};

    if (typeof options === 'object') {
        if (typeof options.updatedAt === 'string') {
           updatedAt = options.updatedAt;
        }

        if (typeof options.createdAt === 'string') {
            createdAt = options.createdAt;
        }
    }

    dataObj[updatedAt] = updatedAtOpts;

    if (schema.path(createdAt)) {
	schema.add(dataObj);
	schema.pre('save', function (next) {
	    if (this.isNew) {
		this[updatedAt] = this[createdAt];
	    } else if (this.isModified()) {
		this[updatedAt] = Date.now();
	    }
	    next();
	});

    } else {
	dataObj[createdAt] = createdAtOpts;
	schema.add(dataObj);
	schema.pre('save', function (next) {
	    if (!this[createdAt]) {
		this[createdAt] = this[updatedAt] = Date.now();
	    } else if (this.isModified()) {
		this[updatedAt] = Date.now();
	    }
	    next();
	});
    }

    schema.pre('findOneAndUpdate', function (next) {
	if (this.op === 'findOneAndUpdate') {
	    this._update = this._update || {};
	    this._update[updatedAt] = Date.now();
	    this._update['$setOnInsert'] = this._update['$setOnInsert'] || {};
	    this._update['$setOnInsert'][createdAt] = Date.now();
	}
	next();
    });

    schema.pre('update', function(next) {
	if (this.op === 'update') {
	    this._update = this._update || {};
	    this._update[updatedAt] = Date.now();
	    this._update['$setOnInsert'] = this._update['$setOnInsert'] || {};
	    this._update['$setOnInsert'][createdAt] = Date.now();
	}
	next();
    });

    if(!schema.methods.hasOwnProperty('touch'))
	schema.methods.touch = function(callback){
	    this[updatedAt] = Date.now();
	    this.save(callback)
	}

}

module.exports = timestampsPlugin;
