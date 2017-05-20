var deleteExts = {
	'users': [],
	'groups': [],
	'directories': []
},
translations = {
	'user': _('user'),
	'users': _('users'),
	'group': _('group'),
	'groups': _('groups'),
	'directory': _('directory'),
	'directories': _('directories')
};
$("#email-users").click(function() {
	$(this).prop("disabled",true);
	$.post( "ajax.php", {command: "email", module: "userman", extensions: deleteExts.users}, function(data) {
		if(data.status) {
			alert(_("Email Sent"));
		} else {
			alert(data.message);
		}
		$(this).prop("disabled",false);
	});
});
$("#directory-users").change(function() {
	var val = $(this).val();
	if(val === '') {
		$("#table-users").bootstrapTable('refresh',{url: 'ajax.php?module=userman&command=getUsers'});
		$("#table-users").bootstrapTable('showColumn','auth');
		$("#remove-users").addClass("hidden");
		$("#add-users").addClass("hidden");
	} else {
		$("#add-groups").attr("href","?display=userman&action=addgroup&directory="+val);
		$("#table-users").bootstrapTable('refresh',{url: 'ajax.php?module=userman&command=getUsers&directory='+$(this).val()});
		$("#table-users").bootstrapTable('hideColumn','auth');
		if(directoryMapValues[val].permissions.addUser) {
			$("#add-users").removeClass("hidden");
		} else {
			$("#add-users").addClass("hidden");
		}
		if(directoryMapValues[val].permissions.removeUser) {
			$("#remove-users").removeClass("hidden");
		} else {
			$("#remove-users").addClass("hidden");
		}
	}
});
$("#directory-groups").change(function() {
	var val = $(this).val();
	if(val === '') {
		$("#table-groups").bootstrapTable('refresh',{url: 'ajax.php?module=userman&command=getGroups'});
		$("#table-groups").bootstrapTable('showColumn','auth');
		$("#remove-groups").addClass("hidden");
		$("#add-groups").addClass("hidden");
	} else {
		$("#add-groups").attr("href","?display=userman&action=addgroup&directory="+val);
		$("#table-groups").bootstrapTable('refresh',{url: 'ajax.php?module=userman&command=getGroups&directory='+$(this).val()});
		$("#table-groups").bootstrapTable('hideColumn','auth');
		if(directoryMapValues[val].permissions.addGroup) {
			$("#add-groups").removeClass("hidden");
		} else {
			$("#add-groups").addClass("hidden");
		}
		if(directoryMapValues[val].permissions.removeGroup) {
			$("#remove-groups").removeClass("hidden");
		} else {
			$("#remove-groups").addClass("hidden");
		}
	}
});
$(".btn-remove").click(function() {
	var type = $(this).data("type"), btn = $(this), section = $(this).data("section");
	var chosen = $("#table-"+section).bootstrapTable("getSelections");
	$(chosen).each(function(){
		deleteExts[type].push(this.id);
	});
	if(confirm(sprintf(_("Are you sure you wish to delete these %s?"),translations[type]))) {
		btn.find("span").text(_("Deleting..."));
		btn.prop("disabled", true);
		$.post( "ajax.php", {command: "delete", module: "userman", extensions: deleteExts[type], type: type}, function(data) {
			if(data.status) {
				btn.find("span").text(_("Delete"));
				$("#table-"+section).bootstrapTable('remove', {
					field: "id",
					values: deleteExts[type]
				});
			} else {
				btn.find("span").text(_("Delete"));
				btn.prop("disabled", true);
				alert(data.message);
			}
		});
	}
});
$("#table-groups").on("reorder-row.bs.table", function (table,rows) {
	var order = {};
	$.each(rows, function(k, v) {
		order[k] = v.id;
	});
	$.post( "ajax.php", {command: "updateGroupSort", module: "userman", sort: JSON.stringify(order)}, function(data) {
		$("#table-groups").bootstrapTable('refresh');
	});
});
$("#table-directories").on("reorder-row.bs.table", function (table,rows) {
	var order = {};
	$.each(rows, function(k, v) {
		order[k] = v.id;
	});
	$.post( "ajax.php", {command: "updateDirectorySort", module: "userman", sort: JSON.stringify(order)}, function(data) {
		$("#table-directories").bootstrapTable('refresh');
	});
});
$("table").on("post-body.bs.table", function () {
	$("table .fa-trash-o").off("click");
	$("table .fa-trash-o").click(function() {
		var id = $(this).data("id"), section = $(this).data("section"), type = $(this).parents("table").data("type"), trans = $(this).data("type");
		if(confirm(sprintf(_("Are you sure you wish to delete this %s?"),translations[trans]))) {
			$.post( "ajax.php", {command: "delete", module: "userman", extensions: [id], type: type}, function(data) {
				if(data.status) {
					$("#table-"+section).bootstrapTable('remove', {
						field: "id",
						values: [id.toString()]
					});
				} else {
					alert(data.message);
				}
			});
		}
	});
});
$("#table-directories").on("post-body.bs.table", function () {
	$(".default-check").click(function() {
		var $this = this;
		if(confirm(_("Are you sure you want to make this directory the system default?"))) {
			$.post("ajax.php?module=userman&command=makeDefault", {id: $(this).data("id")}, function( data ) {
				if(data.status) {
					$(".default-check").removeClass("check");
					$($this).addClass("check");
				} else {
					alert(data.message);
				}
			});
		}
	});
});
$("table").on("page-change.bs.table", function () {
	$(".btn-remove").prop("disabled", true);
	deleteExts.users = [];
	deleteExt.groups = [];
});
$("table").on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function () {
	var toolbar = $(this).data("toolbar"),
			button = $(toolbar).find(".btn-remove"),
			buttone = $(toolbar).find(".btn-send"),
			id = $(this).prop("id"),
			type = $(this).data("type");
	button.prop('disabled', !$("#"+id).bootstrapTable('getSelections').length);
	buttone.prop('disabled', !$("#"+id).bootstrapTable('getSelections').length);
	deleteExts[type] = $.map($("#"+id).bootstrapTable('getSelections'), function (row) {
		return row.id;
  });
});

$("#submitsend").click(function(e) {
	e.stopPropagation();
	e.preventDefault();
	$("input[name=submittype]").val("guisend");
	$(".fpbx-submit").submit();
});

//from http://stackoverflow.com/a/26744533 loads url params to an array
var params={};window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(str,key,value){params[key] = value;});
//Tab and Button stuff
$( document ).ready(function() {
	var hash = (window.location.hash !== "") ? window.location.hash : "users";
	if(hash == '#settings'){
		$('input[name="submit"]').removeClass('hidden');
		$('input[name="submitsend"]').removeClass('hidden');
		$('input[name="reset"]').removeClass('hidden');
		$("#action-bar").removeClass("hidden");
	} else if(params.action == 'adduser' || params.action == 'showuser'){
		$('input[name="submitsend"]').removeClass('hidden');
		$('input[name="submit"]').removeClass('hidden');
		$('input[name="reset"]').removeClass('hidden');
		$('input[name="delete"]').removeClass('hidden');
	}else if(params.action == 'addgroup' || params.action == 'showgroup' || params.action == 'adddirectory' || params.action == 'showdirectory') {
		$('input[name="submit"]').removeClass('hidden');
		$('input[name="reset"]').removeClass('hidden');
		$('input[name="delete"]').removeClass('hidden');
	} else {
		$("#action-bar").addClass("hidden");
	}

	$(".nav-tabs a[href="+hash+"]").tab('show');
	//we should be at the user tab by default so we will show add user.
});
//this fires when you change tabs
$('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
	//Button Related
	switch(e.target.hash){
		case "#directories":
			$("#action-bar").addClass("hidden");
			$('input[name="submit"]').addClass('hidden');
			$('input[name="reset"]').addClass('hidden');
		break;
		case "#settings":
			$("#action-bar").removeClass("hidden");
			$('input[name="submit"]').removeClass('hidden');
			$('input[name="reset"]').removeClass('hidden');
		break;
		case "#users":
			$("#action-bar").addClass("hidden");
			$('input[name="submit"]').addClass('hidden');
			$('input[name="reset"]').addClass('hidden');
		break;
		case "#groups":
			$("#action-bar").addClass("hidden");
			$('input[name="submit"]').addClass('hidden');
			$('input[name="reset"]').addClass('hidden');
		break;
		default:
			return;
	}
	//Add hash to url for reloading
	window.location.hash = e.target.hash.replace();
});

//Making Password Modal work
$(document).on("click", 'a[id^="pwmlink"]', function(){
	var pwuid = $(this).data('pwuid');
	console.log(pwuid);
	$("#pwuid").val(pwuid);
	$("#pwsub").attr("disabled", false);
	$("#pwsub").html(_("Update Password"));
});
$("#pwsub").on("click", function(){
	var button = $(this);
	button.html(_('Updating'));
	button.attr("disabled", true);
	var uid = $("#pwuid").val();
	var pass = $("#password").val();
	$.ajax({
		url: "ajax.php",
		data: {
			module:'userman',
			command:'updatePassword',
			id: uid,
			newpass: pass
		},
		type: "GET",
		dataType: "json",
		success: function(data){
			console.log(data);
				button.html(data.message);

		},
		error: function(xhr, status, e){
			console.dir(xhr);
			console.log(status);
			console.log(e);
		}
	});
});

$('#group_primary').multiselect({
	maxHeight: 300,
	enableFiltering: true,
	enableCaseInsensitiveFiltering: true
});
$('#group_users').multiselect({
	maxHeight: 300,
	includeSelectAllOption: true,
	enableFiltering: true,
	enableCaseInsensitiveFiltering: true,
	selectAllValue: 'select-all-value'
});
$('#defaultextension').multiselect({
	maxHeight: 300,
	enableFiltering: true,
	enableCaseInsensitiveFiltering: true
});

function directoryMap(value, row, index) {
	return directoryMapValues[value].name;
}

function directoryActions(value, row, index) {
	var html = '<a href="?display=userman&amp;action=showdirectory&amp;directory='+row.id+'"><i class="fa fa-edit"></i></a>';
	html += '<a class="clickable"><i class="fa fa-trash-o" data-section="directories" data-type="directory" data-id="'+row.id+'"></i></a>';
	return html;
}

function directoryType(value, row, index) {
	return drivers[row.driver].name;
}

function directoryActive(value, row, index) {
	return (value == 1) ? _('True') : _('False');
}

function userActions(value, row, index) {
	var html = '<a href="?display=userman&amp;action=showuser&amp;user='+row.id+'"><i class="fa fa-edit"></i></a>';

	if(directoryMapValues[row.auth].permissions.changePassword) {
		html += '<a data-toggle="modal" data-pwuid="'+row.id+'" data-target="#setpw" id="pwmlink'+row.id+'" class="clickable"><i class="fa fa-key"></i></a>';
	}

	if(directoryMapValues[row.auth].permissions.removeUser) {
		html += '<a class="clickable"><i class="fa fa-trash-o" data-section="users" data-type="user"  data-id="'+row.id+'"></i></a>';
	}
	return html;
}

function groupActions(value, row, index) {
	var html = '<a href="?display=userman&amp;action=showgroup&amp;group='+row.id+'"><i class="fa fa-edit"></i></a>';

	if(row.local == "1" || directoryMapValues[row.auth].permissions.removeGroup) {
		html += '<a class="clickable"><i class="fa fa-trash-o" data-section="groups" data-type="group"  data-id="'+row.id+'"></i></a>';
	}
	return html;
}

function defaultSelector(value, row, index) {
	return '<div class="default-check '+(row.default == "1" ? 'check' : '')+'" data-id="'+row.id+'"><i class="fa fa-check" aria-hidden="true"></i></div>';
}

$("#user-side").on("click-row.bs.table", function(row, $element) {
	window.location = "?display=userman&action=showuser&user="+$element.id;
});

$("#group-side").on("click-row.bs.table", function(row, $element) {
	window.location = "?display=userman&action=showgroup&group="+$element.id;
});

$("#directory-side").on("click-row.bs.table", function(row, $element) {
	window.location = "?display=userman&action=showdirectory&directory="+$element.id;
});
