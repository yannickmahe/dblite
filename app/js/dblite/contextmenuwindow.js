Dbl.ContextMenuWindow = function(config) {
	Ext.applyIf(config, {
		width : 300,
		height : 200,
		resizable : false,
		layout : "fit",
		modal : true,
		plain : true,
		stateful : true
	});
	Dbl.ContextMenuWindow.superclass.constructor.call(this, config);
};
Ext.extend(Dbl.ContextMenuWindow, Ext.Window, {});
