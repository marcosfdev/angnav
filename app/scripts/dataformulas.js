
function ageBucket(row, field){
  var age = Math.abs(((new Date().getTime()) - row[field.dataSource])/1000/60/60/24);
  switch (true){
    case (age < 31):
      return '000 - 030'
    case (age < 61):
      return '031 - 060'
    case (age < 91):
      return '061 - 090'
    case (age < 121):
      return '091 - 120'
    default:
      return '121+'
  }
};

// Define the structure of fields, if this is not defined then all fields will be assumed
// to be strings.  Name must match csv header row (which must exist) in order to parse correctly.
var fields = [
    // filterable fields
    {name: 'Area_Description',         type: 'string', filterable: true, filterType: 'regexp'},
    {name: 'Project_Description',       type: 'string', filterable: true},
    {name: 'Contract',           type: 'string', filterable: true},
    {name: 'Contract_Description',    type: 'string', filterable: true},
    {name: 'period',              type: 'string', filterable: true},
    {name: 'Accepted_Date',      type: 'date',   filterable: true},
    {name: 'impact_id',        type: 'string', filterable: true},
    {name: 'change_id',        type: 'string', filterable: true},
    {name: 'CDescription',        type: 'string', filterable: true},
    {name: 'change_description',  type: 'string', filterable: true},
    {name: 'ACCOUNT_ID',  type: 'string', filterable: true},
    {name: 'ledger_code',  type: 'string', filterable: true},
    {name: 'account_type',  type: 'string', filterable: true},
    {name: 'CCB',  type: 'string', filterable: true},
    {name: 'AFC',  type: 'string', filterable: true},
    {name: 'IA',  type: 'string', filterable: true},

    // psuedo fields
    {name: 'invoice_mm', type: 'string', filterable: true, pseudo: true,
      pseudoFunction: function(row){
          var date = new Date(row.Accepted_Date);
          return pivot.utils().padLeft((date.getMonth() + 1),2,'0')}
    },
    {name: 'invoice_yyyy_mm', type: 'string', filterable: true, pseudo: true,
      pseudoFunction: function(row){
        var date = new Date(row.invoice_date);
        return date.getFullYear() + '_' + pivot.utils().padLeft((date.getMonth() + 1),2,'0')}
    },
    {name: 'invoice_yyyy', type: 'string', filterable: true, pseudo: true, columnLabelable: true,
      pseudoFunction: function(row){ return new Date(row.period).getFullYear() }},
    {name: 'age_bucket', type: 'string', filterable: true, columnLabelable: true, pseudo: true, dataSource: 'Approved_Date', pseudoFunction: ageBucket},


    // summary fields
    {name: 'CCB',     type: 'float',  rowLabelable: false, summarizable: 'sum', displayFunction: function(value){ return accounting.formatMoney(value)}},
    {name: 'AFC',    type: 'float',  rowLabelable: false, summarizable: 'sum', displayFunction: function(value){ return accounting.formatMoney(value)}},
    {name: 'IA',    type: 'float',  rowLabelable: false, summarizable: 'sum', displayFunction: function(value){ return accounting.formatMoney(value)}},
    {name: 'balance', type: 'float', rowLabelable: false, pseudo: true,
      pseudoFunction: function(row){ return row.CCB + row.AFC + row.IA},
      summarizable: 'sum', displayFunction: function(value){ return accounting.formatMoney(value)}},
    {name: 'Approved_Date',  type: 'date',  filterable: true}
]

  function setupPivot(input){
    input.callbacks = {afterUpdateResults: function(){
      $('#results > table').dataTable ({
        "sDom": "<'row'<'span6'l><'span6'f>>t<'row'<'span6'i><'span6'p>>",
        "iDisplayLength": 50,
        "aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
        "sPaginationType": "bootstrap",
        "oLanguage": {
          "sLengthMenu": "_MENU_ records per page"
        }
      });
    }};
    $('#pivot-demo').pivot_display('setup', input);
  };

  $(document).ready(function() {

    setupPivot({url:'lib/demo2.csv', fields: fields, filters: {Area_Description: '12L - Land & Property'}, rowLabels:["Contract"], summaries:["impact_id", "CCB", "AFC", "IA"]})

    // prevent dropdown from closing after selection
    $('.stop-propagation').click(function(event){
      event.stopPropagation();
    });

    // **Sexy** In your console type pivot.config() to view your current internal structure (the full initialize object).  Pass it to setup and you have a canned report.
    $('#ar-aged-balance').click(function(event){
      $('#pivot-demo').pivot_display('reprocess_display', {rowLabels:["Area_Description", "Project_Description", "CCB", "AFC", "IA"], columnLabels:["age_bucket"], summaries:["balance"]})
    });

    $('#project-report').click(function(event){
      $('#pivot-demo').pivot_display('reprocess_display', {filters:{"Contract":"INAF"},rowLabels:["change_id","Area_Description","Project_Description","change_description","CDescription"]})
    });

    $('#change-report').click(function(event){
      $('#pivot-demo').pivot_display('reprocess_display', {filters:{"change_id":"0000-0000"},rowLabels:["CDescription", "change_description","ACCOUNT_ID", "ledger_code" ]})
    });


    $('#miami-invoice-detail').click(function(event){
      $('#pivot-demo').pivot_display('reprocess_display', {"filters":{"change_id":"0066-0103"},"rowLabels":["Area_Description","Product_Description","Contract","Approved_Date"],"summaries":["period"]})
   });

       $('#contract-detail').click(function(event){
      $('#pivot-demo').pivot_display('reprocess_display', {"filters":{"Contract":"INAF - Accommodation and Facilities"},"rowLabels":["Area_Description","Product_Description", "period", "Approved_Date", "impact_id"]}
        )
    });
  });