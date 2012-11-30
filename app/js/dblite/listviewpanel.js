// Extension of GridPanel that takes care of routine tasks like creating 
// store, colmodel etc.

Dbl.ListViewPanel = function(config) {
    var store = new Ext.data.SimpleStore({
	  fields: config.fields
	});
    
    store.loadData(config.data);
    if(!config.data.length) {
    	return {border: false, padding: '10', html : Messages.getMsg('no_records')};
    }
    var cm = new Ext.grid.ColumnModel({columns: config.models});
    delete config.data;
    delete config.models;
    delete config.fields;
    
    var config1 = Ext.applyIf(config,  {
	  store: store,
	  cm: cm,
	  columnLines: false,
	  viewConfig: {},
	  listeners: {
		'viewready' : function() {
		  this.autoSizeColumns();
	  	},
	  	scope: this
	  }
	});
    
    Dbl.ListViewPanel.superclass.constructor.call(this, config1);
};

Ext.extend(Dbl.ListViewPanel, Ext.grid.GridPanel, {
	autoSizeColumns: function() {

		for (var i = 0; i < this.colModel.getColumnCount(); i++) {
//			var type = this.models[i-1].ctype;
//			if(type == "C" || type == "X") {
//				this.colModel.setRenderer(i, Ext.util.Format.htmlEncode);
//			}
//			if(type == 'X') {
//				this.shorts[i] = true;
//				this.autoSizeColumn(i, 300);
//			}
//			else {
				this.autoSizeColumn(i);
//			}
			// TODO for TEXT set a different editor
		}
		this.view.refresh(true);
	},
	autoSizeColumn: function(c, max) {
		var w = this.view.getHeaderCell(c).firstChild.scrollWidth;
		for (var i = 0; i < this.store.getCount(); i++) {
			var cw  = this.view.getCell(i, c).firstChild.scrollWidth;
			w = Math.max(w, cw);
			if(max && w > max) {  
				w = max;
			}
		}
		if(!w) return;
		this.colModel.setColumnWidth(c, w+2);
		return w;
	}
});
