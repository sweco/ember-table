import Ember from 'ember';

export default Ember.Test.registerHelper('rowText', function(app, assert, rowIndex=0){
  let cells = app.$(`.ember-table-table-row:eq(${rowIndex}) .ember-table-cell`);
  return cells.map(function(){
    return $(this).text().trim();
  }).toArray();
});
