// BEGIN-SNIPPET sg-treetable-component
import Ember from 'ember';
import _ from 'npm:supergroup';
import TableComponent from 'ember-table/components/ember-table';
import TreeTableTreeRow from './sg-treetable/sg-treetable-tree-row';

import TreeColumnDefinition from '../models/tree-column-definition';

export default TableComponent.extend({
  // Overriding default properties
  layoutName: 'components/ember-table',
  numFixedColumns: 1,
  isCollapsed: false,
  isHeaderHeightResizable: true,
  rowHeight: 30,
  hasHeader: true,
  hasFooter: false,
  headerHeight: 70,

  data: null,
  dimentionDef: Ember.A,
  aggregateColumns: [],

  dimentionColumn: Ember.computed('dimentionDef.[]', function() {
    var dimentionDef = this.get('dimentionDef');
    if (Ember.isEmpty(dimentionDef)) {
      return;
    }
    var name = dimentionDef.mapBy('displayName').join(' ▸ ');
    
    return TreeColumnDefinition.create({
      headerCellName: name,
    });
  }),

  dimentions: Ember.computed('dimentionDef.[]', function() {
    return this.get('dimentionDef').mapBy('name');
  }),

  columns: Ember.computed('dimentionColumn', 'aggregateColumns.[]', function() {
    var cols = [];
    cols.addObject(  this.get('dimentionColumn'));
    cols.addObjects( this.get('aggregateColumns'));
    return cols;
  }),

  _sgData: Ember.computed('data', 'dimentions.[]', function() {
    if (!this.get('data')) {
      return Ember.K;
    }
    var groupedData = _.supergroup(this.get('data'), this.get('dimentions'));
    return Ember.Object.create({
      root: groupedData.asRootVal('Total'),
      firstLevel: groupedData,
      flattenTree: groupedData.flattenTree()
    });
  }),

  _rows: Ember.computed('_sgData.root', function() {
    var root = this.get('_sgData.root');
    if (!root) {
      return Ember.A();
    }
    return this._recursiveCreateRow(null, root, Ember.A()).rows;
  }),

  _recursiveCreateRow: function(parent, node, rows) {
    var self = this;
    var row = TreeTableTreeRow.create({ 
      tableComponent: this,
      content: node,
      parent: parent,
      isRoot: !parent,
      depth: node.depth,
      isCollapsed: (this.get('isCollapsed') && (node.depth > 0))
    });
    
    rows.pushObject(row);

    (node.children || []).map(function(child) {
      return self._recursiveCreateRow(row, child, rows).row;
    });

    row.set('isLeaf', Ember.isEmpty(node.children));

    return { row: row, rows: rows };
  },

  bodyContent: Ember.computed('_rows.@each.isShowing', function() {
    var rows = this.get('_rows');
    rows = (rows ? rows.filterBy('isShowing') : Ember.A());
    rows.forEach(function(row, index) {
      return row.set('itemIndex', index);
    });
    return rows;
  }),

  actions: {
    toggleTableCollapse: function() {
      var isCollapsed = this.toggleProperty('isCollapsed');
      this.get('_rows').forEach(function(row) {
        if (row.get('depth') > 0) {
          row.set('isCollapsed', isCollapsed);
        }
      });
    },

    toggleRowCollapse: function(row) {
      row.toggleProperty('isCollapsed');
    }
  },

});
// END-SNIPPET
