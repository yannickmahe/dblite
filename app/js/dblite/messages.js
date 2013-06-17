/*
 * Messages for dblite
 */
var Messages = {
	messages: {
	    // messages for connection related activities
	    noconnection_selected: 'Please select a connection first.',
	    connection_password: 'Please enter the password for {1}.',
	    save_and_connect: 'Please save the connection before you connect.',
	    connection_delete_success: 'Connection deleted successfully.',
	    save_connection: 'Do you want to save changes to {1}?',
	    connection_save_success: 'Connection saved successfully.',

		// 	messages for database related activities
		truncate_database: 'You are going to truncate data for all table(s) in the database ({1}).<br />Are you sure you want to do that?',
		empty_database: 'You are going to drop all table(s) in the database ({1}).<br />Are you sure you want to do that?',
		drop_database: 'You are going to drop the database ({1}).<br />Are you sure you want to do that?',
		backupdb_notable_selected: 'Please select atleast one table to export',
		nodatabase_selected: 'Please select a database first.',
		database_import_success: 'Database imported successfully.',


		// messages for table related activities
		notable_selected: 'Please select a table first.',
		truncate_table: 'You are going to truncate the table ({1}).<br />Are you sure you want to do that?',
		drop_table: 'You are going to drop the table ({1}).<br />Are you sure you want to do that?',
		delete_rows: 'Are you sure you want to delete this selected rows(s)?',
		table_field_required: 'Table should have at least one field!',
		nofield_selected: 'Please select row(s) to delete!',
		drop_column: 'You are going to drop the column ({1}) from table ({2}).<br />Are you sure you want to do that?',
		nofield_definitions: 'There are no field definitions for this table!<br/>Please, define at least one.',
		nofield_datatype: 'Datatype not specified for field name ({1})!',
		cancel_create_table: 'Are you sure you want to {1}?',
		notable_selected: 'Please select a table from the explorer.',
		duplicate_notable_name: 'Please enter new table name!',
		duplicate_nofield_selected: 'Please select at least one field!',
		export_table_nocolumn: 'Please select atleast one column to export!',
		index_addition_success: 'Index added successfully.',
		index_deletion_success: 'Index(s) deleted successfully.',
		edit_index_required: 'Please select an index to edit!',
		edit_index_single: 'Please select a single index to edit!',
		edit_index_footer: 'To reorder just change the order of the columns via drag & drop',
		add_index_column_req: 'Please select at least one column!',
		delete_index_confirm: 'You are going to drop index(s).<br />Are you sure you want to do that?',
		delete_index_required: 'Please select index(s) to delete!',
		reorder_columns_header: 'To reorder just change the order of the columns <br />via drag & drop and then click on reorder',
		reorder_columns_cancel: 'You are going to cancel reordering. <br />Are you sure you want to do that?',
		drop_columns: 'Are you sure you want to drop the selected column(s)?',
		nocolumn_selected: 'Please select column(s) to drop!',
		noindex_definitions: 'There are no index definitions for this table!<br/>Please, define at least one.',
		nocolumns_index: 'Columns not specified for index name ({1})!',
		noindex_columns: 'Index name not specified for column(s) ({1})!',




		// messages for sql editor related activities
		close_editor: 'You are going to close an editor that has unsaved changes.<br />Would you like to save your changes?',
		replace_editor_content: ' Do you want to replace it?',
		delete_editor:  'Are you sure you want to delete this {1}?',

		// messages for view related activities
		drop_view: 'You are going to drop the view ({1}).<br />Are you sure you want to do that?',


		// messages for stored procedure related activities
		drop_procedure: 'You are going to drop the stored procedure ({1}).<br />Are you sure you want to do that?',


		// messages for function related activities
		drop_function: 'You are going to drop the function ({1}).<br />Are you sure you want to do that?',


		// messages for user related activities
		reset_password_success: 'Password reset successfully. Please check your email.',
		current_password_required: 'Please enter your current password.',
		account_update_success: 'Account details updated successfully.',
		change_password_success: 'Password changed successfully.',
		change_email_success: 'Email changed successfully.',
		change_username_success: 'Username changed successfully.',

		// messages for result view related activites
		content_copied: '"({1})" copied to clipboard',

		// other messages
		wait_mask: 'Wait...',
		load_mask: 'Loading...',
		tbd_msg: 'to be implemented...',
		no_records: 'No records found!',
		empty_form_fields: 'Form fields could not be submitted with empty values!',
		prompt_before_leave: 'Please make sure you have saved all your changes. Otherwise it will be lost.',
	},

	getMsg: function(msg_id, params) {
		if(!msg_id) {
			var msg = 'Message id not being passed!';
			Dbl.Utils.showErrorMsg(msg);
		} else {
			var retMsg = this.messages[msg_id];
			if(!retMsg) {
			    return 'No message exists for message id `' + msg_id + '`!';
			} else {
		      if(params instanceof Array) {
		    	  for(var i=0; i<params.length; i++) {
		    		  retMsg = retMsg.replace('{'+ (i+1) +'}', params[i]);
		    	  }
		      }
			  return retMsg;
			}
		}
	}
};