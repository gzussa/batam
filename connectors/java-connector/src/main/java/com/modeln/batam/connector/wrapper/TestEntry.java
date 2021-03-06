/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Model N
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package com.modeln.batam.connector.wrapper;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

/**
 * {
 * 		"id" : "test identifier",
 * 		"build_id" : "build identifier this test belong to",
 * 		"build_name" : "build name this test belong to",
 * 		"report_id" : "report identifier this test belong to",
 * 		"report_name" : "report name this test belong to",
 * 		"name" : "package#testname()",
 * 		"start_date" : "12341234", // Time in millisecond
 * 		"end_date" : "12341234", // Time in millisecond
 * 		"status" : "pass|failed|error| name it",
 * 		"log" : "test logs",
 * 		"criterias" : [{@link com.modeln.batam.connector.wrapper.Pair}],
 * 		"tags" : [{@link java.lang.String}],
 *    	"steps" : [{@link com.modeln.batam.connector.wrapper.Step}],
 * 		"override" : false,
 * 	    "isCustomFormatEnabled" : false,
 * 	    "customFormat" : customFormat to be followed
 * 	    "customEntry" :  special entry to be added on the report
 * }
 * 
 * @author gzussa
 *
 */
public class TestEntry {
	
	private String id;
	
	private String buildId;
	
	private String buildName;
	
	private String reportId; 
	
	private String reportName; 
	
	private String name; 
	
	private String description; 
	
	private Date startDate; 
	
	private Date endDate;
	
	private String status; 
	
	private String log; 
	
	private List<Pair> criterias;
	
	private List<String> tags;
	
	private List<Step> steps;
	
	private boolean override = false;

	private boolean isCustomFormatEnabled = false;

	private String customFormat;

	private String customEntry;
	
	public TestEntry() {
		super();
	}
	
	public TestEntry(String id,
			String buildId,
			String buildName,
			String reportId, 
			String reportName, 
			String name, 
			String description, 
			Date startDate, 
			Date endDate, 
			String status,
			List<Pair> criterias,
			List<String> tags,
			List<Step> steps,
			String log, 
			boolean override) {
		super();
		this.id = id;
		this.buildId = buildId;
		this.buildName = buildName;
		this.reportId = reportId;
		this.reportName = reportName;
		this.name = name;
		this.description = description;
		this.startDate = startDate;
		this.endDate = endDate;
		this.status = status;
		this.criterias = criterias;
		this.tags = tags;
		this.steps = steps;
		this.log = log;
		this.override = override;
	};

	public TestEntry(String id,
					 String buildId,
					 String buildName,
					 String reportId,
					 String reportName,
					 String name,
					 String description,
					 Date startDate,
					 Date endDate,
					 String status,
					 List<Pair> criterias,
					 List<String> tags,
					 List<Step> steps,
					 String log,
					 boolean override,
					 boolean isCustomFormatEnabled,
					 String customFormat,
					 String customEntry) {
		this(id, buildId, buildName, reportId, reportName, name, description, startDate, endDate, status, criterias, tags, steps, log, override);
		this.isCustomFormatEnabled = isCustomFormatEnabled;
		this.customFormat = customFormat;
		this.customEntry = customEntry;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getBuildId() {
		return buildId;
	}

	public void setBuildId(String buildId) {
		this.buildId = buildId;
	}

	public String getBuildName() {
		return buildName;
	}

	public void setBuildName(String buildName) {
		this.buildName = buildName;
	}

	public String getReportId() {
		return reportId;
	}

	public void setReportId(String reportId) {
		this.reportId = reportId;
	}

	public String getReportName() {
		return reportName;
	}

	public void setReportName(String reportName) {
		this.reportName = reportName;
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getLog() {
		return log;
	}

	public void setLog(String log) {
		this.log = log;
	}

	public List<Pair> getCriterias() {
		return criterias;
	}

	public void setCriterias(List<Pair> criterias) {
		this.criterias = criterias;
	}

	public List<String> getTags() {
		return tags;
	}

	public void setTags(List<String> tags) {
		this.tags = tags;
	}

	public List<Step> getSteps() {
		return steps;
	}

	public void setSteps(List<Step> steps) {
		this.steps = steps;
	}

	public boolean isOverride() {
		return override;
	}

	public void setOverride(boolean override) {
		this.override = override;
	}

	public boolean isCustomFormatEnabled() {
		return isCustomFormatEnabled;
	}

	public void setCustomFormatEnabled(boolean isCustomFormatEnabled) {
		this.isCustomFormatEnabled = isCustomFormatEnabled;
	}

	public String getCustomFormat() {
		return customFormat;
	}

	public void setCustomFormat(String customFormat) {
		this.customFormat = customFormat;
	}

	public String getCustomEntry() {
		return customEntry;
	}

	public void setCustomEntry(String customEntry) {
		this.customEntry = customEntry;
	}

	@SuppressWarnings("unchecked")
	public String toJSONString() {
		JSONObject obj = new JSONObject();
		obj.put("id", id);
		obj.put("build_id", buildId);
		obj.put("build_name", buildName);
		obj.put("report_id", reportId);
		obj.put("report_name", reportName);
		obj.put("name", name);
		obj.put("description", description);
		obj.put("start_date", startDate == null ? null : String.valueOf(startDate.getTime()));
		obj.put("end_date", endDate == null ? null : String.valueOf(endDate.getTime()));
		obj.put("status", status);
		obj.put("criterias", criterias);
		obj.put("tags", tags);
		obj.put("steps", steps);
		obj.put("log", log);
		obj.put("override", override);
		obj.put("isCustomFormatEnabled", isCustomFormatEnabled);
		obj.put("customFormat", customFormat);
		obj.put("customEntry", customEntry);
		return obj.toJSONString();
	}
	
	@Override
	public String toString() {
		return toJSONString();
	}
	
	@SuppressWarnings("unchecked")
	public static TestEntry fromJSON(JSONObject obj){
		String id = (String)obj.get("id");
		String buildId = (String)obj.get("build_id");
		String buildName = (String)obj.get("build_name");
		String reportId = (String)obj.get("report_id");
		String reportName = (String)obj.get("report_name");
		String name = (String)obj.get("name");
		String description = (String)obj.get("description");
		String startDate = (String)obj.get("start_date");
		String endDate = (String)obj.get("end_date");
		String status = (String)obj.get("status");
		boolean override = (Boolean)obj.get("override");
		
		List<Pair> criterias = new ArrayList<Pair>();
		JSONArray criteriasArray = (JSONArray)obj.get("criterias");
		if(criteriasArray != null){
			for(Iterator<JSONObject> it = criteriasArray.iterator(); it.hasNext();){
				JSONObject criteria = it.next();
				criterias.add(Pair.fromJSON(criteria));
			}
		}
		
		List<String> tags = new ArrayList<String>();
		JSONArray tagsArray = (JSONArray)obj.get("tags");
		if(tagsArray != null){
			for(Iterator<String> it =  tagsArray.iterator(); it.hasNext();){
				String tag = it.next();
				tags.add(tag);
			}
		}
		
		List<Step> steps = new ArrayList<Step>();
		JSONArray stepsArray = (JSONArray)obj.get("steps");
		if(stepsArray != null){
			for(Iterator<JSONObject> it = stepsArray.iterator(); it.hasNext();){
				JSONObject step = it.next();
				steps.add(Step.fromJSON(step));
			}
		}
		
		String log = (String)obj.get("log");

		boolean isCustomFormatEnabled = (Boolean)obj.get("isCustomFormatEnabled") == null? false:(Boolean)obj.get("isCustomFormatEnabled");
		String customFormat = (String)obj.get("customFormat");
		String customEntry = (String)obj.get("customEntry");
		
		return new TestEntry(id, buildId, buildName, reportId, reportName, name, description, 
				startDate == null ? null : new Date(Long.valueOf(startDate)), 
				endDate == null ? null : new Date(Long.valueOf(endDate)), 
				status, criterias, tags, steps, log, override, isCustomFormatEnabled, customFormat, customEntry);
	}
}
