/**
 * @constructor
 */
Dbl.AddIndexFormPanel = function() {
	var radioGroupItems = [{
	                   		boxLabel: 'Unique',
	                   		name: 'add_index_form_index_type',
	                   		id: 'add_index_form_index_type_unique',
	                   		inputValue: 'unique'
	                   	}, {
	                   		boxLabel: 'Full Text',
	                   		name: 'add_index_form_index_type',
	                   		id: 'add_index_form_index_type_fullText',
	                   		inputValue: 'fullText'
	                   	}, 	{
	                   		boxLabel: 'Primary',
	                   		name: 'add_index_form_index_type',
	                   		id: 'add_index_form_index_type_primary',
	                   		inputValue: 'primary',
	                   		listeners: {
	                   			'check': {
	                   				fn: function() {
	                   					var form = Ext.getCmp('add_index_form').getForm().getValues(false);
	                   					var indexName = Ext.getCmp('add_index_form_index_name');
	                   					if(form.add_index_form_index_type == 'primary') {
	                   						indexName.prevValue = form.add_index_form_index_name;
	                   						indexName.setValue('PRIMARY');
	                   						indexName.disable();
	                   					} else {
	                   						indexName.setValue(indexName.prevValue);
	                   						indexName.enable();
	                   					}
	                   				}
	                   			}
	                   		}
	                   	}, {
	                   		boxLabel: 'None',
	                   		name: 'add_index_form_index_type',
	                   		id: 'add_index_form_index_type_none',
	                   		inputValue: 'none',
	                   		checked: true
	                   	}];
	                   
	Dbl.AddIndexFormPanel.superclass.constructor.call(this, {
		id: 'add_index_form',
		labelAlign: 'top',
		bodyStyle: "padding: 5px",
		defaults: {
			anchor: '100%'
		},
		items:[{
				xtype: 'textfield',
				fieldLabel: 'Index Name',
				name: 'add_index_form_index_name',
				id: 'add_index_form_index_name',
				blankText: 'Index name is required',
				allowBlank: false
			}, 	{
				xtype: 'hidden',
				name: 'add_index_form_original_name',
				id: 'add_index_form_original_name'
			},  {
				xtype: 'radiogroup',
				rows: 1,
				id: 'options_group',
				defaults: {
					anchor: '100%'
			    },
			    bodyStyle: "padding: 0px; margin: 0px",
			    items: radioGroupItems,	
			    fieldLabel: 'Index Options'
			}]
	});
};

Ext.onReady(function() {
	Ext.extend(Dbl.AddIndexFormPanel, Ext.FormPanel, {
	});
});

