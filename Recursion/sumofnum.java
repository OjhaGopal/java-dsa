package Recursion;

public class sumofnum {
    public static void main(String[] args) {
        int n = 5;
        System.out.println(sumnum(n));
        
    }

    public static int sumnum(int n){
        if(n==1){
            return 1;
        }
        return sumnum(n-1)+n;
    }
}

// Here we are using the concept of Recursion
// Recursion is a process in which a function calls itself directly or indirectly.
// In this case we are using the concept of Recursion to find the sum of first n natural numbers.
