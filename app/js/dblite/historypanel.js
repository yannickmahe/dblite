/**
 * @constructor
 */
var HistoryPanel = function(data) {

    data = this.attachRenderer(data);

	this.models = data.columns;
	var store = new Ext.data.SimpleStore({
		fields: data.cols
	});

	if(!data.rows) data.rows = '';

	store.loadData(data.rows);

	var columnModel = new Ext.grid.ColumnModel({
		columns: this.models
	});

	HistoryPanel.superclass.constructor.call(this, {
		id: 'history_grid',
		store: store,
		cm: columnModel,
		border: false,
		columns: data.columns,
		columnLines: true,
		autoScroll: true,
		viewConfig : {},
		listeners: {
			celldblclick: this.showContent,
			scope: this
		}
	});
};



Ext.extend(HistoryPanel, Ext.grid.GridPanel, {
	attachRenderer: function(data) {
	if(data.rows) {
		for(column in data.columns) {
			if(data.columns[column].id == 'run_query') {
				data.columns[column].renderer = this.renderIcon;
			}
			if(data.columns[column].id == 'query') {
				data.columns[column].renderer = this.renderCodeMirror.createDelegate(this);
			}
			if(data.columns[column].id == 'status') {
				data.columns[column].renderer = this.renderSatusTooltip;
			}
		}
	}
	return data;
	},

	renderSatusTooltip: function(val, cell) {
		cell.attr = 'ext:qtip="' + val + '"';
		return val;
	},

	renderIcon: function(val, cell) {
		return '<a href="javascript:void(0);" onclick="Dbl.Utils.executeRow();"><div class="execute_row_sql">exe</div></a>';
	},

	renderCodeMirror: function(val, cell) {
		var out = Ext.DomHelper.append(document.body, {tag: 'div', html: '', cls:'hidden'});
		highlightText(val, out, SqlParser);
		cell.attr = 'ext:qtip="' + this.htmlSpecialCharsEncode(val) + '"';
		return out.innerHTML;
	},

	htmlSpecialCharsEncode: function(str) {
		str = str.replace(/\&/g, "&amp;");
		str = str.replace(/>/g, "&gt;");
		str = str.replace(/</g, "&lt;");
		str = str.replace(/\"/g, "&quot;");
		str = str.replace(/\'/g, "&#39;");
		return str;
	},
	
	showContent: function(grid, rowIndex, columnIndex, event) {
		var record = grid.getStore().getAt(rowIndex);  // Get the Record
		var fieldName = grid.getColumnModel().getDataIndex(columnIndex); // Get field name
		var data = record.get(fieldName);
		var cur_column = grid.getColumnModel().columns[columnIndex];
		
		if((fieldName != "query") && (fieldName != "status")) {
			return;
		}	

		var field_obj = {row: rowIndex, record: record};
		var buttons = [{
			  text : "close",
			  handler : function() {
				  Ext.getCmp("history_query_window").close();
			  }
		  }];


		var lontexteditconfig = {
				title : (fieldName == "query") ? "Query" : "Status",
				id : "history_query_window",
				width : 300,
				height : 350,
				resizable : true,
				autoScroll : true,
				layout : "fit",
				modal : true,
				plain : true,
				stateful : true,
				items : [new LongTextEditPanel(Ext.util.Format.htmlEncode(data)) ],
				buttons: buttons
			};

		this.win = new Ext.Window(lontexteditconfig);
		this.win.show();
		return false;
	},
});

