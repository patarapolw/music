package main

import (
	"os"
	"os/signal"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	res := api.Prepare()
	defer res.Cleanup()

	server.Serve(&res)

	c := make(chan os.Signal)
	signal.Notify(c, os.Interrupt)

	<-c
}
