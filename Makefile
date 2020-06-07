CC=g++
CFLAGS=-g -Wall -Isrc/
LIBS=-lraylib -lGL -lm -lpthread -ldl -lrt -lX11

out/game : out/main.o
	$(CC) $(CFLAGS) $(LIBS) -o out/game out/main.o

out/main.o : src/main.cc
	$(CC) $(CFLAGS) -c src/main.cc -o out/main.o

clean :
	rm out/*
