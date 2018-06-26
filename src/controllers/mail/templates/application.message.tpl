<style>
	p {
		-webkit-margin-before: 0.5em;
	    -webkit-margin-after: 0.5em;
	    -webkit-margin-start: 0px;
	    -webkit-margin-end: 0px;	   
	}

	section.content {
		margin-top: 10px;
		padding: 20px;	
	}

	section h4 { font-weight: 600; }
	section h4.span { font-style: italic; }

	h6.textarea { color: blue; font-weight: 500;}

</style>


<p ><span style="width:75px;float:left;margin-right: 15px;">Date: </span> %(date)s</span></p>
<p ><span style="width:75px;float:left;margin-right: 15px;">Time: </span> %(time)s</span></p>
<p ><span style="width:75px;float:left;margin-right: 15px;">To: </span>%(fullName)s</p>
<p ><span style="width:75px;float:left;margin-right: 15px;">Subject: </span>%(subject)</p>

<section class="content"?
	
	<h4 class="title">Status Report <span>%(applicationName)</span></h4>

	<table class="full-width" cellspacing="1">
		
		<h6 class="text-blue">Message</h6>
		<tr><td>Section</td><td>%(section)s</td></tr>
		<tr><td>EventID</td><td>%(eventID)s</td></tr>
		<tr><td>Environment</td><td>%(environment)s</td></tr>
		<tr><td>Message</td><td>%(message)s</td></tr>

	</table>	

</section>


