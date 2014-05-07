
/**
 * Module dependencies.
 */
var path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    _ = require('lodash');

exports = module.exports = init;

/**
 * Module initialization function.
 *
 * @public
 */
function init(config) {
  return new TiqJSON(config);
}

function readJSON(file) {
  try {
    var data = require(file);
  } catch (err) {
    var data = {};
  }
  return data;
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), {mode: 420});
}


/**
 * Main module object.
 *
 * @param {Object} config
 * @param {string} [config.file="$XDG_DATA_HOME/tiq/store.json"] - The file
 *     used to store the data.
 * @constructor
 * @private
 */
function TiqJSON(config) {
  var defaultConfig = {
      file: path.join(process.env.XDG_DATA_HOME ||
              path.join(process.env.HOME, '.local', 'share'),
              'tiq', 'store.json'
            )
    },
    config = _.merge(defaultConfig, config || {});

  this.config = config;
  return this;
}


/**
 * Associate a collection of tokens with a collection of tags.
 *
 * @param {Array.<string>} tokens
 * @param {Array.<string>} tags
 * @param {string} [ns=''] - Namespace to prefix all tags and tokens with.
 * @param {Object} [data={}]
 */
TiqJSON.prototype.associate = function(tokens, tags, ns) {
  if (!tokens.length || !tags.length) {
    return;
  }

  ns = ns || '';
  data = this.store;

  var key = '';
  for (var i = 0; i < tokens.length; i++) {
    key = ns ? ns + ':::' + tokens[i] : tokens[i];
    data[key] = _.union(data[key] || [], tags);
  }

  for (var i = 0; i < tags.length; i++) {
    key = ns ? ns + ':::' + tags[i] : tags[i];
    data[key] = _.union(data[key] || [], tokens);
  }
}


/**
 * Get the tags associated with the given tokens.
 *
 * @param {Array.<string>} tokens
 * @param {string} [ns=''] - Namespace to prefix all tokens with.
 * @param {Object} [data={}]
 */
TiqJSON.prototype.describe = function(tokens, ns) {
  if (!tokens.length) {
    return;
  }

  ns = ns || '';
  data = this.store;

  var tags = [];
  // Get all tags associated with each token
  for (var i = 0; i < tokens.length; i++) {
    key = ns ? ns + ':::' + tokens[i] : tokens[i];
    tags.push(data[key] || []);
  }

  // Only unique tags
  return _.intersection.apply(this, tags);
}

/**
 * Read the data.
 */
TiqJSON.prototype.enter = function() {
  this.store = readJSON(this.config.file);
}

/**
 * Persist the data.
 */
TiqJSON.prototype.exit = function() {
  // Make sure the storage directory exists
  mkdirp.sync(path.dirname(this.config.file));
  writeJSON(this.config.file, this.store);
}
