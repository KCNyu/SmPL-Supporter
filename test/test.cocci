@@
identifier F = main;
expression E, E1, E2;
@@
F(...){
<+...
- if(E1 == E2)
+ ASSERT_NE(E1, E2);
{
...
- return 1;
}
...+>
}