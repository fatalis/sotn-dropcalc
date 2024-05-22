var enemy_data = null;
var luck = 8;
var arcana = 0;
var initial_update = true;

function calculate_rates()
{
	var data = []

	$.each(enemy_data, function(i, e) {
		var rare_percent = 0;
		var uncommon_percent = 0;
		
		if (e.rare_rate > 0)
			rare_percent = Math.min(drop_percentage(luck, arcana, e.base_rate, e.rare_rate), 100.0).toFixed(2);
		if (e.uncommon_rate > 0)
			uncommon_percent = Math.min(drop_percentage(luck, arcana, e.base_rate, e.uncommon_rate), 100.0).toFixed(2);
		
		data.push([e.id,
			e.name,
			e.rare_name,
			rare_percent > 0 ? rare_percent : "",
			e.uncommon_name,
			uncommon_percent > 0 ? uncommon_percent : ""
		]);
	});
	
	if (initial_update)
	{
		$("#table").dataTable({
			"aaData": data,
			"aaSorting": [[1, "asc"]],
			"bPaginate": false,
			"bLengthChange": false,
			"bFilter": true,
			"bSort": true,
			"bInfo": false,
			"bAutoWidth": false,
			"sDom": "ft",
			"aoColumnDefs": [
				{
					"mRender": function (data, type, row) {
						var f = data > 0 ? "(" + "1/" + Math.round(10000 / (data * 100)) + ")" : "";
						return data + "<span class='fraction'>" + f + "</span>";
					},
					"aTargets": [ 3, 5 ]
				}
			]
		});
		
		$("#table_filter").appendTo("#search");
		
		initial_update = false;
	}
	else
	{
		var table = $("#table").dataTable();
		$.each(table.fnGetData(), function(i, row)
		{
			table.fnUpdate(data[i], i, undefined, false, false);
		});
		table.fnDraw();
	}
}

// huge thanks to Megiddo for math help
function drop_percentage(luck, arcana, base_drop_rate, drop_rate)
{
        var chance_none = 0;
        var chance_drop = 0;
        var sum = 0;
        chance_none = (256 - base_drop_rate - Math.floor((base_drop_rate * luck) / 128.0)) / 256.0;
        if (chance_none < 0)
        	console.debug(chance_none);
        for (var i = 0; i < 32; i++)
                sum += Math.floor(luck / 20.0 + i / 20.0);
        chance_drop = (1 - chance_none) * ((drop_rate * arcana + drop_rate) / 256.0 + sum / 8192);
        return chance_drop*100;
}

$.extend($.fn.dataTableExt.oStdClasses, {
	"sWrapper": "dataTables_wrapper form-inline"
});

$(document).ready(function() {
	$.ajax({
		url: "data/enemies.json"
	}).success(function(data) {
		enemy_data = data;
		calculate_rates();
	});
	
	$("#luck").on("input", function() {
		var val = $(this).val()
		if (val != "-" && val != "")
		{
			var prevLuck = luck;
			luck = parseInt($(this).val(), 10);
			if (!(luck >= -10 && luck <= 255))
			{
				luck = prevLuck;
				$(this).val(prevLuck.toString());
			}
			calculate_rates();
		}
	});
	
	$("#luck").keypress(function(e) {
		var code = e.charCode || e.keyCode;
		// allow 0-9, backspace, and minus
		if (!(code >= 48 && code <= 57) && code != 8 && code != 45)
			e.preventDefault();
	});
	
	$("input:radio[name=arcana]").click(function() {
    	arcana = parseInt($(this).val(), 10);
    	calculate_rates();
	});
});
