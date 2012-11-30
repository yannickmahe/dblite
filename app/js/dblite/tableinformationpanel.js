/**
 * @constructor
 */
Dbl.TableInformationPanel = function(panel) {
	Dbl.TableInformationPanel.superclass.constructor.call(this, {
		id: 'table_information_panel',
       	layout: 'fit',
		split: true,
		border: false,
		header: false,
		tbar: this.buildTopToolbar(),
		items: [panel]
	});
};

Ext.extend(Dbl.TableInformationPanel, Ext.Panel, {
	buildTopToolbar : function() {
	    return [{
			text:'Refresh',
			id: 'refresh_info_btn',
			tooltip: 'Refresh',
			iconCls: 'refresh_info_btn',
			width: 75,
			ref: '../refreshInfoBtn',
			handler: this.refreshInfo,
			scope: this
	    }];
   },
   
   refreshInfo: function() {
		Database.sendCommand('get_table_status', {
			table: Dbl.UserActivity.getValue('table'), 
			database: Dbl.UserActivity.getValue('database'),
			asView: true,
			scope: this},
			function(data) {
				this.removeAll();
				this.add(data.panel);
				this.doLayout();
			}
		);
   }
});
