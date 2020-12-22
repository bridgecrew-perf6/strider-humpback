"use strict";

const debug = require("debug")("strider-humpback:webapp");

module.exports = {
  // mongoose schema, if you need project-specific config
  config: {
    humpback: {
      url: { type: String },
      group: { type: String },
    },
  },
};
