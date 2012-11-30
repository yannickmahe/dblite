var SelectableListViewPanel = function(config) {
	var selectionModel = new Ext.grid.CheckboxSelectionModel({
        //header: '',
        checkOnly: true,
		init: function(grid){
	        this.grid = grid;
	        this.initEvents();
        }
    });
	var models = new Array(selectionModel);
	config.models = models.concat(config.models);
	config.sm = selectionModel;
	SelectableListViewPanel.superclass.constructor.call(this, config);
};
Ext.extend(SelectableListViewPanel, Dbl.ListViewPanel, {});