var RestoreDbPanel = function(current_db) {
	RestoreDbPanel.superclass.constructor.call(this, 
	{
		id : 'restore_db',
		region : 'center',
		xtype : 'panel',
		layout : 'fit',
		items : [ this.createForm(current_db)]
	}); 
};

Ext.extend(RestoreDbPanel, Ext.Panel, {
	createForm: function(current_db) {
		return new Ext.FormPanel({
	        fileUpload: true,
	        frame: true,
	        labelAlign: 'top',
	        name: 'restore_db_form',
	        id: 'restore_db_form',
	        defaults: {
	            anchor: '90%',
	            allowBlank: false	            
	        },
			items : [{
	            xtype:'tbtext',
	            text: 'Current DB: <b>' + current_db +'</b>',
	            anchor:'100%'
	        },
	        {
	        	xtype: 'hidden',
	        	name: 'database',
	        	value: current_db
	        },
	        {
				xtype: 'hidden',
				name: 'connection_id',
				value: Server.connection_id
			},
	        {
				xtype: 'fileuploadfield',
		        id: 'restore_db_file',
		        emptyText: 'Select a file to execute',
		        buttonText: "Upload"
	        }/*,
	        {
	        	xtype: 'tbtext',
	        	id: 'selected_db',
	        	text: current_db,
	        	hidden: true
	        },
	        {
	        	xtype: 'tbtext',
	        	id: 'restore_query_text',
	        	text: 'Query(s) executed: ',
	        	anchor:'100%',
	        	hidden: false,
	        	style: {
	        		display: 'inline'
	        	}
	        },
	        {
	        	xtype: 'tbtext',
	        	id: 'restore_query_number',
	        	text: 24,
	        	hidden: false,
	        	style: {
	        		display: 'inline'
	        	}
	        }*/
	        
	      ],
	      buttons: [{
	    	  	text: "Execute",
	    	  	handler: function() {
	    	  		var formObj = Ext.getCmp('restore_db_form').getForm();
	    	  		if(formObj.isValid()) {
			  	  		var loadmask = new Ext.LoadMask('restore_db', {msg:"Loading..."});
				  		loadmask.show();
				  		formObj.submit({
		                    url: MAIN_URL + '/cmd.php?command=import.import_db&form=1',
		                    params: {connection_id: Server.connection_id },
		                    success: function(fp, o){
				  				if(o.result.success == 'pass') {
				  					loadmask.hide();
				  					Dbl.Utils.showInfoMsg(Messages.getMsg('database_import_success'), 'restore_db');
				  					if(current_db != 'none') {
					   					Explorer.explorerPanel.removeAll();
					   					Explorer.loadExplorerData(current_db);
				  					}
				  				}
				  				else {
				  					loadmask.hide();
				  					Dbl.Utils.showInfoMsg(o.result.msg, 'restore_db');
				  				}
		                    }
		                });
				  		
	    	  		}
	      		}
	      	}/*,
	      	{
	    	  	text: "cancel",
	    	  	handler: function() {
	      			Ext.getCmp("restore_db_window").close();
	      		}
	      	}*/
	      ]
		});
	}
});