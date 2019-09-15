package testdata

import (
	"fmt"
	"os"
)

func Main() {
	// langauge

	x := 1
	x += 1
	fmt.Sprintf("%d")

	os.Open("main.go")
}

func unused(unusedParam int) error {

	return nil

	x := 1
	x += 1
	return nil
}
