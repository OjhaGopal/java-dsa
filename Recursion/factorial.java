package Recursion;

public class factorial {

    public static void main(String[] args){
        int n = 1;
        System.out.println(fact(n));
    }

    public static int fact(int n){
        if(n==1){
            return 1;
        }
        return fact(n-1)*n;
    }
    
}

// Here we are using the concept of Recursion
// Recursion is a process in which a function calls itself directly or indirectly.
// In this case we are using the concept of Recursion to find the factorial of a number.
// We start from the base case and then we call the function recursively.