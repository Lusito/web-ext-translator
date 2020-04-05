import { useDispatch } from "react-redux-nano";

export default () => {
    const dispatch = useDispatch();
    return (key: string) => dispatch({ type: "HIDE_DIALOG", payload: key });
};
