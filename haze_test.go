package main

import "testing"

func TestReadXML(t *testing.T) {
	_, err := grabData()
	if err != nil {
		t.Error("Cannot grab data:", err)
	}
}

func TestGetTimestamp(t *testing.T) {
	d, _ := grabData()
	time := timestamp(d)
	t.Log("Time:", time)
}
