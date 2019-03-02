// Load the core build.
// var _ = require('lodash/core');
import {
  map,
  tail,
  times,
  uniq
} from 'lodash';
console.log(_.chunk(['a', 'b', 'c', 'd'], 2));