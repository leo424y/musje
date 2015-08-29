/* global musje */

(function (musje) {
  'use strict';

  musje.extend(musje.Score.prototype,
  /** @lends musje.Score.prototype */
  {
    /**
     * Initialize the score
     */
    initialize: function () {
      this.prepareTimewise();
      this.extractBars();
      this.prepareCells();
      this.linkTies();
    },

    /**
     * A cell is identically a measure in a part or a part in a measure.
     * @param  {Function}
     */
    walkCells: function (callback) {
      this.parts.forEach(function (part, p) {
        part.measures.forEach(function (cell, m) {
          callback(cell, m, p);
        });
      });
    },

    /**
     * Walk each music data.
     * @param  {Function} callback
     */
    walkMusicData: function (callback) {
      this.walkCells(function (cell, m, p) {
        cell.data.forEach(function (data, d) {
          callback(data, d, m, p);
        });
      });
    },

    /**
     * Prepare timewise data.
     */
    prepareTimewise: function () {
      var measures = this.measures;
      this.walkCells(function (cell, m) {
        measures[m] = measures[m] || new musje.TimewiseMeasure();
        measures[m].parts.push(cell);
      });
    },

    /**
     * Extract bars in each cell out into the measure.
     */
    extractBars: function () {
      var measures = this.measures;
      measures.forEach(function (measure, m) {
        measure.parts.forEach(function (cell) {
          var
            data = cell.data,
            len = data.length;
          if (!len) { return; }

          // barRight
          if (len && data[len - 1].$name === 'Bar') {
            measure.barRight = data.pop();
          }

          // barLeft
          if (data[0] && data[0].$name === 'Bar') {
            measure.barLeft = data.shift();
          } else {
            if (m !== 0) {
              measure.barLeft = measures[m - 1].barRight;
            }
          }
        });
      });
    },

    /**
     * Prepare cells
     */
    prepareCells: function () {
      this.walkCells(function (cell) {
        cell.data.forEach(function (data, d) {
          data.cell = cell;
          data.index = d;
        });
        cell.makeBeams(1);
      });
    },

    /**
     * Link ties
     */
    linkTies: function () {
      var prev = null;

      this.walkMusicData(function (data) {
        var tie;

        if (data.$name === 'Note') {
          tie = data.duration.tie;
          data.duration.tie = {};
          if (prev) {
            data.duration.tie.prev = prev;
            prev.duration.tie.next = data;
          }
          prev = tie ? data : null;
        }
      });
    }

  });

}(musje));
