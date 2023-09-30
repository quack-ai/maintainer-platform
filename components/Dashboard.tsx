import { ArrowLeftIcon, PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { useEffect, useState } from "react";

import ReorderableList from "./ReorderableList.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog.tsx";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/use-toast.ts";
import { getAxiosErorrMessage } from "./utils.tsx";

export const Dashboard = (props: {
  authToken: string;
  selectedRepoId: number | null;
  selectedRepoConnected: boolean;
  className: string;
}) => {
  const [selectedGuidelineId, setSelectedGuidelineId] = useState(null);

  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [loadingGuidelines, setLoadingGuidelines] = useState(false);
  const [newCreatingGuidline, setNewCreatingGuidline] = useState<{
    title: string;
    details: string;
  } | null>(null);
  const [triggerGuidelineRefetch, setTriggerGuidelineRefetch] = useState(0);

  const [savingGuideline, setSavingGuideline] = useState(false);
  const [deletingGuideline, setDeletingGuideline] = useState(false);
  const TITLE_MIN_CHARS = 6;
  const TITLE_MAX_CHARS = 100;
  const DETAILS_MIN_CHARS = 6;
  const DETAILS_MAX_CHARS = 1000;

  const selectedGuideline =
    guidelines.find((guideline: any) => guideline.id === selectedGuidelineId) ||
    newCreatingGuidline;

  useEffect(() => {
    setGuidelines([]);
  }, [props.selectedRepoId, props.authToken]);

  useEffect(() => {
    if (props.authToken && props.selectedRepoId) {
      setLoadingGuidelines(true);
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/repos/${props.selectedRepoId}/guidelines`,
          {
            headers: {
              Authorization: "Bearer " + props.authToken,
            },
          },
        )
        .then((res: any) => {
          setGuidelines(res.data);
          setLoadingGuidelines(false);
        })
        .catch((e) => {
          console.error(e);
          toast({
            variant: "destructive",
            title: "Could not fetch guidelines",
            description: getAxiosErorrMessage(e).toString(),
          });
          setLoadingGuidelines(false);
        });
    }
  }, [props.authToken, props.selectedRepoId, triggerGuidelineRefetch]);

  return (
    <Card style={{ height: "100%" }} className={"p-4 " + props.className || ""}>
      <CardHeader>
        <div className="flex justify-between items-center">
          {selectedGuideline && (
            <Button
              onClick={() => {
                setSelectedGuidelineId(null);
                setNewCreatingGuidline(null);
              }}
            >
              <ArrowLeftIcon />
            </Button>
          )}
          <CardTitle className="text-4xl mb-4">Guideline Management</CardTitle>
          {!selectedGuideline && (
            <Button
              className="mr-4"
              onClick={() => {
                setNewCreatingGuidline({
                  title: "",
                  details: "",
                });
              }}
            >
              <PlusIcon className="mr-1" />
              Create Guideline
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex">
          {selectedGuideline && (
            <div className="editorPanel flex-grow p-4">
              <CardTitle className="mb-4">Editor</CardTitle>
              <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={selectedGuideline.title}
                  onChange={(e: any) => {
                    if (newCreatingGuidline) {
                      const newNewCreatingGuideline = {
                        ...selectedGuideline,
                        title: e.target.value,
                      };
                      setNewCreatingGuidline(newNewCreatingGuideline);
                      return;
                    }

                    const newGuideline = {
                      ...selectedGuideline,
                      title: e.target.value,
                    };

                    const guidelineIndex = guidelines.findIndex(
                      (g) => g.id === selectedGuideline.id,
                    );

                    const newGuidelines = [...guidelines];
                    newGuidelines.splice(guidelineIndex, 1, newGuideline);

                    setGuidelines(newGuidelines);
                  }}
                />
              </div>
              <div className="grid w-full gap-1.5 mb-4">
                <Label htmlFor="desc">Details</Label>
                <Textarea
                  id="desc"
                  value={selectedGuideline.details}
                  onChange={(e: any) => {
                    if (newCreatingGuidline) {
                      const newNewCreatingGuideline = {
                        ...selectedGuideline,
                        details: e.target.value,
                      };
                      setNewCreatingGuidline(newNewCreatingGuideline);
                      return;
                    }

                    const newGuideline = {
                      ...selectedGuideline,
                      details: e.target.value,
                    };

                    const guidelineIndex = guidelines.findIndex(
                      (g) => g.id === selectedGuideline.id,
                    );

                    const newGuidelines = [...guidelines];
                    newGuidelines.splice(guidelineIndex, 1, newGuideline);

                    setGuidelines(newGuidelines);
                  }}
                />
                <CardDescription className="text-sm text-slate-500">
                  These details help inform the purpose of the guideline.
                </CardDescription>
              </div>
              <Button
                variant={"outline"}
                className="mb-4 mr-4"
                onClick={() => {
                  setSavingGuideline(true);
                  if (newCreatingGuidline) {
                    if (
                      newCreatingGuidline.title.length >= TITLE_MIN_CHARS &&
                      newCreatingGuidline.title.length <= TITLE_MAX_CHARS &&
                      newCreatingGuidline.details.length >= DETAILS_MIN_CHARS &&
                      newCreatingGuidline.details.length <= DETAILS_MAX_CHARS
                    ) {
                      axios
                        .post(
                          `${process.env.NEXT_PUBLIC_API_URL}/guidelines/`,
                          {
                            ...newCreatingGuidline,
                            repo_id: props.selectedRepoId,
                            order: guidelines.length,
                          },
                          {
                            headers: {
                              Authorization: "Bearer " + props.authToken,
                            },
                          },
                        )
                        .then((res) => {
                          setNewCreatingGuidline(null);
                          setTriggerGuidelineRefetch(
                            triggerGuidelineRefetch + 1,
                          );
                          setSavingGuideline(false);
                        })
                        .catch((e) => {
                          toast({
                            variant: "destructive",
                            title: "Could not create new guideline",
                            description: getAxiosErorrMessage(e).toString(),
                          });
                          setSavingGuideline(false);
                        });
                    } else {
                      toast({
                        variant: "destructive",
                        title: "Invalid length of title or details",
                        description: `Title length is expected to be between ${TITLE_MIN_CHARS} and ${TITLE_MAX_CHARS}. Details length is expected to be between ${DETAILS_MIN_CHARS} and ${DETAILS_MAX_CHARS}.`,
                      });
                      setSavingGuideline(false);
                    }
                  } else {
                    if (
                      selectedGuideline.title.length >= TITLE_MIN_CHARS &&
                      selectedGuideline.title.length <= TITLE_MAX_CHARS &&
                      selectedGuideline.details.length >= DETAILS_MIN_CHARS &&
                      selectedGuideline.details.length <= DETAILS_MAX_CHARS
                    ) {
                      axios
                        .put(
                          `${process.env.NEXT_PUBLIC_API_URL}/guidelines/${selectedGuidelineId}`,
                          {
                            title: selectedGuideline.title,
                            details: selectedGuideline.details,
                          },
                          {
                            headers: {
                              Authorization: "Bearer " + props.authToken,
                            },
                          },
                        )
                        .then((res) => {
                          setSelectedGuidelineId(null);
                          setTriggerGuidelineRefetch(
                            triggerGuidelineRefetch + 1,
                          );
                          setSavingGuideline(false);
                        })
                        .catch((e) => {
                          console.error(e);
                          toast({
                            variant: "destructive",
                            title: "Could not save guideline",
                            description: getAxiosErorrMessage(e).toString(),
                          });
                          setSavingGuideline(false);
                        });
                    } else {
                      toast({
                        variant: "destructive",
                        title: "Invalid length of title or details",
                        description: `Title length is expected to be between ${TITLE_MIN_CHARS} and ${TITLE_MAX_CHARS}. Details length is expected to be between ${DETAILS_MIN_CHARS} and ${DETAILS_MAX_CHARS}.`,
                      });
                      setSavingGuideline(false);
                    }
                  }
                }}
              >
                {savingGuideline && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {newCreatingGuidline ? "Create Guideline" : "Save Guideline"}
              </Button>
              {!newCreatingGuidline && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={"outline"} className="mb-4">
                      Delete Guideline
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your guideline.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setDeletingGuideline(true);
                          axios
                            .delete(
                              `${process.env.NEXT_PUBLIC_API_URL}/guidelines/${selectedGuidelineId}`,
                              {
                                headers: {
                                  Authorization: "Bearer " + props.authToken,
                                },
                              },
                            )
                            .then((res: any) => {
                              setTriggerGuidelineRefetch(
                                triggerGuidelineRefetch + 1,
                              );
                              setDeletingGuideline(true);
                            })
                            .catch((e) => {
                              console.error(e);
                              setDeletingGuideline(true);
                            });
                        }}
                      >
                        {deletingGuideline && (
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
        {!selectedGuideline && (
          <ReorderableList
            onEdit={(g: any) => setSelectedGuidelineId(g.id)}
            guidelines={guidelines}
            loadingGuidelines={loadingGuidelines}
            setGuidelines={(newGuidelines: any) => {
              const order = newGuidelines.map((g: any) => g.id);
              axios
                .put(
                  `${process.env.NEXT_PUBLIC_API_URL}/repos/${props.selectedRepoId}/guidelines/order`,
                  {
                    guideline_ids: order,
                  },
                  {
                    headers: {
                      Authorization: "Bearer " + props.authToken,
                    },
                  },
                )
                .then((res: any) => {
                  setTriggerGuidelineRefetch(triggerGuidelineRefetch + 1);
                })
                .catch((e) => {
                  console.error(e);
                  setTriggerGuidelineRefetch(triggerGuidelineRefetch + 1);
                  toast({
                    variant: "destructive",
                    title: "Could not change guideline order",
                    description: getAxiosErorrMessage(e).toString(),
                  });
                });

              setGuidelines(newGuidelines);
            }}
            selectedRepoId={props.selectedRepoId}
            authToken={props.authToken}
            triggerRefetchGuidelines={() => {
              setTriggerGuidelineRefetch(triggerGuidelineRefetch + 1);
            }}
          />
        )}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
