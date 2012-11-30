Ext.onReady(function() {
   	var viewport = new Ext.Viewport( {
   		layout: 'border',
   		items: [
   			new Ext.Panel({
   			     title: 'West',
			     region:'west',
			     width: 250,
			     minSize: 100,
			     maxSize: 400,
			     split: true,
   			}),
   			new Ext.Panel( {
   			     title: 'center',
			     region:'center',
   			}) 
   		]
	});
});

