package main

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
)

type Data struct {
	Regions []Region `xml:"item>region"`
}

type Region struct {
	Id       string    `xml:"id"`
	Readings []Reading `xml:"record>reading"`
}

type Reading struct {
	Type  string `xml:"type,attr"`
	Value int    `xml:"value,attr"`
}

var psiUrl string

func main() {
	server := http.Server{
		Addr: ":8080",
	}
	psiUrl = "http://www.nea.gov.sg/api/WebAPI/?dataset=psi_update&keyref=781CF461BB6606AD0308169EFFAA82316F750CA80D381E25"

	http.HandleFunc("/psi", allReadings)
	http.HandleFunc("/psi/region", region)
	fmt.Println("sghazeserv 0.1")
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

// get PSI data for a specific region: rNO, rSO, rEA, rWE, rCE
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

// extract the PSI from the JSON
func reading(region string, data Data) int {
	for _, reg := range data.Regions {
		if reg.Id == region {
			for _, reading := range reg.Readings {
				if reading.Type == "NPSI" {
					return reading.Value
				}
			}
		}
	}
	return 0
}
