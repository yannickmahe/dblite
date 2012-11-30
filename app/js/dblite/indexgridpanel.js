/**
 * @constructor
 */
Dbl.IndexGridPanel = function(data) {
	data = this.attachRenderer(data);
	
	
	Dbl.IndexGridPanel.superclass.constructor.call(this, {
		fields: data.fields, 
		data: data.data, 
		models: data.models,
		id: 'manage_indexes_grid',
		autoExpandColumn: 'fullText',
		viewConfig: { 
			//forceFit: true 
		},
		//layout: 'fit',
        border: false,
        autoScroll: true
	});
};

Ext.onReady(function() {
	Ext.extend(Dbl.IndexGridPanel, Dbl.ListViewPanel, {
		  attachRenderer: function(data) {
				for(var i=0; i<data.models.length; i++) {
					switch(data.models[i].id) {
						case 'indexName':
							data.models[i].header = 'Indexs';
							data.models[i].width = 200;
							break;
						case 'columns':
							data.models[i].header = 'Columns';
							data.models[i].width = 200;
							break;
						case 'unique':
							data.models[i].header = 'Unique';
							data.models[i].width = 70;
							data.models[i].renderer = function(v) {
								return '<input type="checkbox" '+(v?'checked="checked"':'')+' disabled="disabled" />';
							}
							break;
						case 'fullText':
							data.models[i].header = 'Full Text';
							data.models[i].width = 70;
							data.models[i].renderer = function(v) {
								return '<input type="checkbox" '+(v?'checked="checked"':'')+' disabled="disabled" />';
							}
							break;
						default:
							break;
					}
				}
				
				return data;
		  }
	});
});

