// Copyright (c) 2015 Chang Sau Sheong
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

package main

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"time"
)

type Data struct {
	Regions []Region `xml:"item>region"`
}

type Region struct {
	Id     string     `xml:"id"`
	Lat    string     `xml:"latitude"`
	Long   string     `xml:"longitude"`
	Record RecordData `xml:"record"`
}

type RecordData struct {
	Timestamp string    `xml:"timestamp,attr"`
	Readings  []Reading `xml:"reading"`
}

type Reading struct {
	Type  string `xml:"type,attr"`
	Value int    `xml:"value,attr"`
}

var psiUrl string

func init() {
	psiUrl = "http://www.nea.gov.sg/api/WebAPI/?dataset=psi_update&keyref=781CF461BB6606AD0308169EFFAA82316F750CA80D381E25"
}
func main() {
	server := http.Server{
		Addr: ":" + os.Getenv("PORT"),
	}

	http.HandleFunc("/psi", allReadings)
	http.HandleFunc("/psi/region", region)
	http.HandleFunc("/psi/region/all", allRegions)
	server.ListenAndServe()
}

// get data from NEA
func grabData() (data Data, err error) {
	response, err := http.Get(psiUrl)
	if err != nil {
		fmt.Println("Cannot get data from NEA:", err)
	}
	defer response.Body.Close()

	xmlData, _ := ioutil.ReadAll(response.Body)
	err = xml.Unmarshal(xmlData, &data)
	if err != nil {
		fmt.Println("Cannot unmarshal XML:", err)
		return
	}
	return
}

// view all reading as JSON
func allReadings(w http.ResponseWriter, r *http.Request) {
	data, err := grabData()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

// get PSI data for a specific region: NRS, rNO, rSO, rEA, rWE, rCE
func region(w http.ResponseWriter, r *http.Request) {
	region := r.FormValue("r")
	data, err := grabData()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte(strconv.Itoa(reading(region, data))))
}

// get PSI readings and descriptors for all regions, in JSON
func allRegions(w http.ResponseWriter, r *http.Request) {
	data, err := grabData()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	jsonFmt := `
{
	"last_updated": "%s",
	"readings":{
		"overall":%d,
		"north":%d, 
		"south":%d, 
		"east":%d, 
		"west":%d, 
		"center":%d
	},
	"descriptors":{
		"overall":"%s",
		"north":"%s", 
		"south":"%s", 
		"east":"%s", 
		"west":"%s", 
		"center":"%s"
	}
}
`
	overall, north, south, east, west, center := reading("NRS", data),
		reading("rNO", data), reading("rSO", data), reading("rEA", data),
		reading("rWE", data), reading("rCE", data)
	time := timestamp(data)
	jsonData := fmt.Sprintf(jsonFmt, time, overall, north, south, east, west,
		center, describe(overall), describe(north), describe(south),
		describe(east), describe(west), describe(center))

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(jsonData))
}

func timestamp(data Data) string {
	for _, reg := range data.Regions {
		if reg.Id == "NRS" {
			t,_ := time.Parse("20060102150400", reg.Record.Timestamp)
			return t.Format("3:04pm Jan 2, 2006")
		}
	}
	return "Not found"
}

// extract the PSI from the JSON
func reading(region string, data Data) int {
	for _, reg := range data.Regions {
		if reg.Id == region {
			for _, reading := range reg.Record.Readings {
				if reading.Type == "NPSI_PM25_3HR" {
					return reading.Value
				}
			}
		}
	}
	return 0
}

// description of PSI level
func describe(psi int) string {
	switch {
	case psi <= 50:
		return "Good"
	case psi <= 100:
		return "Moderate"
	case psi <= 200:
		return "Unhealthy"
	case psi <= 300:
		return "Very Unhealthy"
	case psi > 300:
		return "Hazardous"
	}
	return ""
}
