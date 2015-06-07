//var width=$(".axisX").width();
//if(width>800) width=800;
var width=800;
var height=500;
var scaleX=d3.scale.linear().range([0,width-100]).domain([1985,2014]);
var scaleY=d3.scale.linear().range([height-100,0]).domain([0,100]);
var scaleColor=d3.scale.category20();
var axisX = d3.svg.axis()
    .scale(scaleX)
    .orient("bottom")
    .ticks(15);

var axisY = d3.svg.axis()
    .scale(scaleY)
    .orient("left")
    .ticks(10);
var svg=d3.select("#chart").append("svg").attr("width",width).attr("height",width*5/8).attr("viewBox","0 0 800 500");
var g=svg.append("g");
var line = d3.svg.line()  
    .x(function(d,i) {  
        return scaleX(parseInt(d.key)); //利用尺度運算資料索引，傳回x的位置  
    })  
    .y(function(d) {
	if(d.values[0].key=="") return scaleY(0);   
        else return scaleY(parseFloat(d.values[0].key)); //利用尺度運算資料的值，傳回y的位置  
    });
svg.append("g").attr("class","axisX").call(axisX)
svg.append("text").attr("class","labelX").attr("x",width-140).attr("y",height-20).text("單位：年");
svg.append("g").attr("class","axisY").call(axisY);
var areaWidth=$("#chart").width()-100;
var areaHeight=$("#chart").height()-100;
var area=svg.append("rect").attr("class","area_mask").attr("x",80).attr("y",20)
		.attr("width",areaWidth).attr("height",areaHeight).on("mousemove",rectInteraction);
var yearScale=d3.scale.linear().range([80,80+areaWidth]).domain([1985,2014]);
function rectInteraction(){
	d3.select(".yearPath").remove();
	console.log(yearScale.invert(d3.mouse(this)[0]));
	var year=yearScale.invert(d3.mouse(this)[0]);
	var value;
	var first="";
	var second="";
	g.append("line").attr("class","yearPath").attr("stroke","gray")
		.attr("x1",scaleX(year))
		.attr("y1",0)
		.attr("x2",scaleX(year))
		.attr("y2",areaHeight);
	//g.selectAll(".circleOnLine").remove();
	d3.csv("deathrate.csv",function(data){
	for(var index in $("input[name='death[]']")){
		//itemName[index]+=")";
		itemName=$("input[name='death[]']")[index].defaultValue;
		if($("input[value="+itemName+"]").prop("checked")) {
			value=computeValue(data,itemName,year);
			console.log(value);
			//g.append("circle").attr("cx",scaleX(year)).attr("cy",scaleY(value)).attr("r",2).attr("class","circleOnLine");
			$($("#menu text")[index]).text(":"+value);//.text();
		}
	}
	});
	
}
function computeValue(data,itemName,year){
	var ceil=Math.ceil(year);
	var floor=Math.floor(year);
	var ceilValue,floorValue;
	var value;
		theItem=d3.nest().key(function(d){return d.year;}).key(function(d){return d[itemName];}).entries(data);
	for(var index in theItem){
		if(parseInt(theItem[index].key)==floor) floorValue=parseFloat(theItem[index].values[0].key); 
		if(parseInt(theItem[index].key)==ceil) ceilValue=parseFloat(theItem[index].values[0].key); 
	}
	value=Math.round(((year-floor)*(ceilValue-floorValue)+floorValue)*100)/100;
	return value;
}
function checkAll(){
	if($("input[name='all']").prop("checked")){
		$("input[name='death[]']").prop("checked",true);
	}
	else{
		$("input[name='death[]']").prop("checked",false);
	}
	createPath();
	
}
function createPath(){
	if($("input[value='所有死因']").prop("checked")) redraw(800);
	else if($("input[value='惡性腫瘤']").prop("checked")||$("input[value='腦血管疾病']").prop("checked")) redraw(200);
	else {redraw(100);}
	var theItem={};
	for(var i in $("input[name='death[]']")){
	itemName=$("input[name='death[]']")[i].defaultValue;
	if(!($("input[value="+itemName+"]").prop("checked"))) {
		$($("label")[i-1+2]).css("color","#000");
		d3.select(".dataPath."+itemName).remove();
	}
	else {
		$($("label")[i-1+2]).css("color",scaleColor(itemName));
		create(itemName);
		function create(itemName){
		d3.csv("deathrate.csv",function(data){
			theItem=d3.nest().key(function(d){return d.year;}).key(function(d){return d[itemName];}).entries(data);
			if($(".dataPath."+itemName).length!=0){
				g.select(".dataPath."+itemName).transition().duration(500).attr("d",line(theItem));
			}
			else{ 
				g.append("path").attr("d",line(theItem))
					.attr("stroke",scaleColor(itemName)).attr("class",itemName).classed("dataPath",true);
			}
		});
		}
	}
	}
	
	
}
function redraw(max){
	scaleY=d3.scale.linear().range([height-100,0]).domain([0,max]);
	d3.selectAll(".zeroPath").remove();
 	axisY = d3.svg.axis()
   	 .scale(scaleY)
  	  .orient("left")
    	.ticks(10);
	svg.select(".axisY").call(axisY);
	g.selectAll(".itemColor").remove();
	
//svg.append("g").attr("class","axisY").call(axisY);
	
}