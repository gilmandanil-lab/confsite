package main
import (
  "fmt"
  "golang.org/x/crypto/bcrypt"
)
func main(){
  hash := "$2a$10$0b0o2k7k6GqvJpH4TtZCFeUq4Kqgqv8lQmKq8p3Tn4Yx4WqS1eEJ6"
  pw := "Admin123!"
  err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw))
  fmt.Printf("match=%v err=%v\n", err==nil, err)
}
