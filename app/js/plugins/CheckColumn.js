/*
 * Including the javascript required for that checkcolumn!
 * As it's not part of the core EXT suite.
 */

Ext.ux.CheckColumn = function(config) {
  Ext.apply(this, config);
  if(!this.id) {
    this.id = Ext.id();
  }
  this.renderer = this.renderer.createDelegate(this);
};

Ext.ux.CheckColumn.prototype = {
  init : function(grid) {
    this.grid = grid;
    this.grid.on('render', function() {
      var view = this.grid.getView();
      view.mainBody.on('mousedown', this.onMouseDown, this);
    }, this);
  },

  onMouseDown : function(e, t) {
	if(Dbl.UserActivity.getValue('table_type') == 'view') {
		return false;
	} 

	if (t.className && t.className.indexOf('x-grid3-cc-' + this.id) != -1) {
      e.stopEvent();
      var rowIndex = this.grid.getView().findRowIndex(t);
      var record = this.grid.store.getAt(rowIndex);
      
      if((this.grid.id == 'create_table_grid')
    		  || (this.grid.id == 'alter_table_grid')) {
 		    	   if(!record.data.field_name) {
    	  				return false;
    	  		   } 
 		    	   else {
 						var isEditable = this.grid.checkForEdit(record.data.datatype, this.dataIndex);
 						if(!isEditable) {
 							return false;
 						}
 						if(this.dataIndex == 'not_null' 
	  			   			&& record.data.not_null === true
	  			   				&& record.data.primary_key === true) {
 									return false
 						}
 		    	   }
      }
      
      record.set(this.dataIndex, !record.data[this.dataIndex]);

      if(this.grid.id == 'alter_table_grid') {
//    	 Ext.getCmp('alter_table_panel').alterButton.enable();
//       Ext.getCmp('alter_table_panel').cancelButton.enable();
    	 
    	 Ext.getCmp('alter_table_panel').getTopToolbar().get(0).enable();
       	 
       	 // track down the modified table field
       	 if (this.grid.modifiedFields.indexOf(record.data.field_name) == -1) {
       		if (this.grid.changedFieldsOld.indexOf(record.data.field_name) == -1) {
       			this.grid.modifiedFields.push(record.data.field_name);
       		}
       	}
      } 
    }
  },

  renderer : function(v, p, record) {
    p.css += ' x-grid3-check-col-td';
    return '<div  class="x-grid3-check-col' + (v ? '-on' : '') + ' x-grid3-cc-'
        + this.id + '"> </div>';
  }
};
